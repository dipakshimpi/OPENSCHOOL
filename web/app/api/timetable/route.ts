import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const classGrade = searchParams.get('class_grade');
        const section = searchParams.get('section');
        const teacherId = searchParams.get('teacher_id');

        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();

        // 1. Fetch raw timetables (avoiding complex joins that cause PGRST200)
        let query = supabase.from('timetables').select('*');

        if (classGrade && section) {
            query = query.eq('class_grade', classGrade).eq('section', section);
        } else if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        const { data: timetables, error } = await query.order('period_number', { ascending: true });

        if (error) throw error;
        if (!timetables || timetables.length === 0) return NextResponse.json([]);

        // 2. Fetch teacher profiles manually to resolve names
        const uniqueTeacherIds = [...new Set(timetables.map(t => t.teacher_id).filter(Boolean))];
        const teacherMap: Record<string, { full_name: string }> = {};

        if (uniqueTeacherIds.length > 0) {
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', uniqueTeacherIds);

            if (!pError && profiles) {
                profiles.forEach(p => {
                    teacherMap[p.id] = { full_name: p.full_name };
                });
            }
        }

        // 3. Merge profiles back into timetable data
        const enrichedTimetables = timetables.map(t => ({
            ...t,
            teacher: teacherMap[t.teacher_id] || { full_name: 'Unknown Teacher' }
        }));

        return NextResponse.json(enrichedTimetables);
    } catch (error) {
        console.error("FETCH_TIMETABLE_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (session.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminClient = createAdminClient();

        const body = await request.json();
        const { class_grade, section, day_of_week, period_number, subject, teacher_id, start_time, end_time } = body;

        // Validation
        if (!class_grade || !section || !day_of_week || !period_number || !subject) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upsert based on unique constraint (class, section, day, period)
        // We first check if one exists to handle conflicts or use upsert if we defined the constraint right
        // Upsert based on the unique_class_slot constraint
        const { data, error } = await adminClient
            .from('timetables')
            .upsert({
                class_grade,
                section,
                day_of_week,
                period_number,
                subject,
                teacher_id,
                start_time,
                end_time
            }, {
                onConflict: 'class_grade,section,day_of_week,period_number' // Removing spaces for strict match
            })
            .select();

        if (error) {
            console.error("❌ SUPABASE_UPSERT_ERROR:", error);

            // Check for teacher double-booking (23505 is Unique Violation)
            if (error.code === '23505' && error.message.includes('unique_teacher_slot')) {
                return NextResponse.json({
                    error: "Teacher Busy",
                    details: "This teacher is already assigned to another class during this period."
                }, { status: 409 });
            }

            return NextResponse.json({
                error: "Database Conflict",
                details: error.message,
                code: error.code
            }, { status: 409 });
        }

        return NextResponse.json(data[0]);
    } catch (error: unknown) {
        const err = error as Error;
        console.error("UPDATE_TIMETABLE_ERROR:", err);
        return NextResponse.json({
            error: "Failed to update timetable",
            details: err.message
        }, { status: 500 });
    }
}

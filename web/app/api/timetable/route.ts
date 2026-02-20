import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const classGrade = searchParams.get('class_grade');
        const section = searchParams.get('section');
        const teacherId = searchParams.get('teacher_id');

        const supabase = await createClient();

        let query = supabase.from('timetables').select(`
            *,
            teacher:profiles(full_name)
        `);

        if (classGrade && section) {
            query = query.eq('class_grade', classGrade).eq('section', section);
        } else if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        const { data, error } = await query.order('period_number', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("FETCH_TIMETABLE_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = await createClient();

        // Check Admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.uid)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { class_grade, section, day_of_week, period_number, subject, teacher_id, start_time, end_time } = body;

        // Validation
        if (!class_grade || !section || !day_of_week || !period_number || !subject) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upsert based on unique constraint (class, section, day, period)
        // We first check if one exists to handle conflicts or use upsert if we defined the constraint right
        // Upsert based on the unique_class_slot constraint
        const { data, error } = await supabase
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

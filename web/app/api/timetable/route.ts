import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
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
                onConflict: 'class_grade, section, day_of_week, period_number'
                // Note: onConflict requires the exact constraint name or column list. 
                // In my migration I defined: unique_class_slot UNIQUE (class_grade, section, day_of_week, period_number)
            })
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("UPDATE_TIMETABLE_ERROR:", error);
        return NextResponse.json({ error: "Failed to update timetable" }, { status: 500 });
    }
}

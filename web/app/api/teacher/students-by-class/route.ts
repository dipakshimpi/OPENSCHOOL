import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const grade = searchParams.get('grade');
        const section = searchParams.get('section');

        if (!grade || !section) {
            return NextResponse.json({ error: "Missing grade or section parameters" }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Fetch students in this grade and section
        const { data: students, error } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('role', 'student')
            .eq('grade_level', grade)
            .eq('section', section)
            .eq('is_approved', true)
            .order('full_name');

        if (error) throw error;

        // Also fetch today's attendance for these students to see if they're already marked
        const today = new Date().toISOString().split('T')[0];
        const { data: attendance } = await supabaseAdmin
            .from('student_attendance')
            .select('student_id, status')
            .eq('date', today);

        const attendanceMap = new Map(attendance?.map(a => [a.student_id, a.status]) || []);

        const studentsWithAttendance = students.map(s => ({
            ...s,
            status: attendanceMap.get(s.id) || 'pending'
        }));

        return NextResponse.json(studentsWithAttendance);
    } catch (error) {
        console.error("FETCH_STUDENTS_FOR_ATTENDANCE_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch student list" }, { status: 500 });
    }
}

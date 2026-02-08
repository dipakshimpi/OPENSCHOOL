import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { courseId, students } = body; // students is an array of { id, present }

        if (!courseId || !Array.isArray(students)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Prepare data for upsert
        const attendanceData = students.map((s: { id: string; present: boolean }) => ({
            student_id: s.id,
            course_id: courseId,
            teacher_id: user.id,
            status: s.present ? 'present' : 'absent',
            date: new Date().toISOString().split('T')[0]
        }));

        const { error } = await supabase
            .from('student_attendance')
            .upsert(attendanceData, { onConflict: 'student_id, course_id, date' });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Attendance records synchronized!" });
    } catch (error) {
        console.error("STUDENT_ATTENDANCE_POST_ERROR:", error);
        return NextResponse.json({ error: "Failed to save records" }, { status: 500 });
    }
}

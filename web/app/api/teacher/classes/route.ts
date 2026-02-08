import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch courses where the user is the instructor
        const { data: courses, error } = await supabase
            .from('courses')
            .select('*, enrollments(count)')
            .eq('instructor_id', user.id);

        if (error) throw error;

        const classes = (courses || []).map(course => ({
            id: course.id,
            title: course.title,
            schedule: "Mon, Wed, Fri", // Default schedule for now
            time: "10:00 AM - 11:30 AM", // Default time for now
            studentCount: course.enrollments?.[0]?.count || 0,
            status: "Active"
        }));

        return NextResponse.json({ classes });
    } catch (error) {
        console.error("TEACHER_CLASSES_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

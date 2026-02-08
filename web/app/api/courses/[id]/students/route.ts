import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: courseId } = await params;

        // Verify the teacher owns this course (optional but good for security)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('instructor_id')
            .eq('id', courseId)
            .single();

        if (courseError || course.instructor_id !== user.id) {
            return NextResponse.json({ error: "Forbidden or Course not found" }, { status: 403 });
        }

        // Get enrollments with profile names
        const { data: enrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('student_id, profiles(full_name)')
            .eq('course_id', courseId);

        if (enrollError) throw enrollError;

        const students = (enrollments || []).map(e => ({
            id: e.student_id,
            name: (e.profiles as unknown as { full_name: string })?.full_name || "Unknown Student"
        }));

        return NextResponse.json(students);
    } catch (error) {
        console.error("GET_COURSE_STUDENTS_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

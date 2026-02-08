import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface CourseEnrollment {
    course_id: string;
    courses: {
        id: string;
        title: string;
        description: string;
        instructor_id: string;
        profiles: {
            full_name: string;
        } | null;
    } | null;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch courses the student is enrolled in
        const { data: enrollments, error } = await supabase
            .from("enrollments")
            .select(`
                course_id,
                courses (
                    id,
                    title,
                    description,
                    instructor_id,
                    profiles (full_name)
                )
            `)
            .eq("student_id", user.id);

        if (error) throw error;

        const enrollmentList = (enrollments as unknown as CourseEnrollment[]) || [];

        // For each course, count the videos
        const coursesWithVideoCount = await Promise.all(
            enrollmentList.map(async (enrollment) => {
                const course = enrollment.courses;
                if (!course) return null;

                const { count } = await supabase
                    .from("videos")
                    .select("*", { count: "exact", head: true })
                    .eq("course_id", course.id);

                return {
                    id: course.id,
                    title: course.title,
                    instructor: course.profiles?.full_name || "Unknown Instructor",
                    videoCount: count || 0,
                    grade: "Standard"
                };
            })
        );

        return NextResponse.json({ courses: coursesWithVideoCount.filter(Boolean) });
    } catch (error) {
        console.error("STUDENT_COURSES_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

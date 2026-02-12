import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is a teacher
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "teacher") {
            return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
        }

        // Fetch courses with video count
        const { data: courses, error } = await supabase
            .from("courses")
            .select(`
        *,
        videos (count)
      `)
            .eq("instructor_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("TEACHER_COURSES_ERROR:", error);
            throw error;
        }

        // Transform data
        const transformedCourses = courses?.map(course => ({
            ...course,
            videoCount: course.videos?.[0]?.count || 0
        })) || [];

        return NextResponse.json(transformedCourses);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

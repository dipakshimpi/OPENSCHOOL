import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Parse request body
        const body = await request.json();
        const { title, description, thumbnail_url, instructor_id, grade_level } = body;

        if (!title || !instructor_id || !grade_level) {
            return NextResponse.json({ error: "Title, instructor, and grade level are required" }, { status: 400 });
        }

        // Verify instructor exists and is approved
        const { data: instructor } = await supabase
            .from("profiles")
            .select("id, role, is_approved")
            .eq("id", instructor_id)
            .single();

        if (!instructor || instructor.role !== "teacher" || !instructor.is_approved) {
            return NextResponse.json({ error: "Invalid or unapproved instructor" }, { status: 400 });
        }

        // Insert course
        const { data, error } = await supabase
            .from("courses")
            .insert({
                title,
                description,
                thumbnail_url,
                instructor_id,
                grade_level,
            })
            .select()
            .single();

        if (error) {
            console.error("ADMIN_COURSE_INSERT_ERROR:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("ADMIN_COURSE_API_ERROR:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

// Use Service Role for backend-to-backend communication
export const dynamic = "force-dynamic";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function GET() {
    try {
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const userId = session.uid;

        // Check if user is a teacher
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

        if (profile?.role !== "teacher") {
            return NextResponse.json({ error: "Teacher access required" }, { status: 403 });
        }

        // Fetch courses with video count
        // Using explicit join syntax if needed, but the original query was fine if constraints exist
        // Fetch courses without join to ensure stability
        const { data: courses, error } = await supabaseAdmin
            .from("courses")
            .select('*')
            .eq("instructor_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("TEACHER_COURSES_ERROR:", error);
            throw error;
        }

        // Transform data
        const transformedCourses = (courses || []).map(course => ({
            ...course,
            videoCount: 0 // Placeholder until join issue is resolved
        }));

        return NextResponse.json(transformedCourses);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("TEACHER_COURSES_API_ERROR:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

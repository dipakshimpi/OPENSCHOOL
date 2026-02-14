import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

// Use Service Role for backend-to-backend communication
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
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();
        const userId = session.uid;

        const { data: enrollments, error } = await supabaseAdmin
            .from('enrollments')
            .select('course_id')
            .eq('student_id', userId);

        if (error) {
            console.error("GET_ENROLLMENTS_ERROR:", error);
            throw error;
        }
        return NextResponse.json(enrollments);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("GET_ENROLLMENTS_API_ERROR:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const supabaseAdmin = getSupabaseAdmin();
        const userId = session.uid;

        // 2. Parse request body
        const body = await request.json();
        const { courseId } = body; // Notice case sensitivity: usually sent as courseId

        if (!courseId) {
            return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }

        // 3. Insert enrollment
        const { data, error: insertError } = await supabaseAdmin
            .from('enrollments')
            .insert({
                student_id: userId,
                course_id: courseId,
                progress: 0
            })
            .select()
            .single();

        if (insertError) {
            if (insertError.code === '23505') {
                return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 });
            }
            throw insertError;
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("POST_ENROLLMENT_API_ERROR:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

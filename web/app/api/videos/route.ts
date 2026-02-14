import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        const adminClient = createAdminClient();

        // 1. Fetch videos (without join first for stability)
        let query = adminClient.from('videos').select('*');
        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        const { data: videos, error: videosError } = await query.order('created_at', { ascending: false });

        if (videosError) {
            console.error("GET_VIDEOS_DB_ERROR:", videosError);
            throw videosError;
        }

        if (!videos || videos.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Fetch courses separately to merge metadata (Robust Join)
        const uniqueCourseIds = [...new Set(videos.map(v => v.course_id).filter(Boolean))];
        const { data: coursesData, error: coursesError } = await adminClient
            .from('courses')
            .select('id, title')
            .in('id', uniqueCourseIds);

        const courseMap: Record<string, string> = {};
        if (!coursesError && coursesData) {
            coursesData.forEach(c => {
                courseMap[c.id] = c.title;
            });
        }

        // 3. Merge data
        const transformedVideos = videos.map(v => ({
            ...v,
            courses: { title: courseMap[v.course_id] || "Unknown Course" }
        }));

        return NextResponse.json(transformedVideos);
    } catch (error) {
        console.error("GET_VIDEOS_API_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Use Firebase authentication (same pattern as /api/courses)
        const session = await verifySession();

        console.log("🔐 Auth check:", {
            hasSession: !!session,
            userId: session?.uid,
            userEmail: session?.email
        });

        if (!session) {
            console.error("❌ No authenticated user found");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.uid;

        const body = await request.json();
        const { title, description, peertube_url, course_id, thumbnail_url, duration } = body;

        if (!title || !peertube_url || !course_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Match various formats:
        // http://localhost:9001/w/shortUUID
        // https://example.com/w/shortUUID
        // http://127.0.0.1:9001/w/shortUUID
        const urlMatch = peertube_url.match(/\/w\/([a-zA-Z0-9_-]+)/);

        if (!urlMatch) {
            console.error("Invalid URL Format:", peertube_url);
            return NextResponse.json({ error: "Invalid PeerTube URL format. Expected format: .../w/VIDEO_ID" }, { status: 400 });
        }
        const videoId = urlMatch[1];

        // Use admin client for database operations (bypasses RLS)
        const adminClient = createAdminClient();

        // Log the data being inserted for debugging
        const videoData = {
            id: videoId,  // Use PeerTube ID as primary key
            title,
            description,
            peertube_url,
            thumbnail_url,
            duration,
            course_id,
            teacher_id: userId
        };

        console.log("📹 Attempting to save video:", {
            videoId,
            title,
            courseId: course_id,
            teacherId: userId
        });

        const { data, error } = await adminClient
            .from('videos')
            .insert(videoData)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("VIDEO_METADATA_SAVE_ERROR:", error);

        // Type-safe error details extraction
        interface DatabaseError {
            code?: string;
            message?: string;
            details?: string;
            hint?: string;
        }

        const dbError = error as DatabaseError;
        console.error("Error details:", {
            message: error instanceof Error ? error.message : String(error),
            code: dbError.code,
            details: dbError.details,
            hint: dbError.hint,
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        const supabase = await createClient();
        let query = supabase.from('videos').select('*, courses(title)');

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        const { data: videos, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(videos);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { title, description, peertube_url, course_id } = body;

        if (!title || !peertube_url || !course_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Extract video ID from PeerTube URL
        // Format: http://127.0.0.1:9000/w/VIDEO_ID or https://peertube.example.com/w/VIDEO_ID
        const urlMatch = peertube_url.match(/\/w\/([a-zA-Z0-9_-]+)/);
        if (!urlMatch) {
            return NextResponse.json({ error: "Invalid PeerTube URL format. Expected format: http://domain/w/VIDEO_ID" }, { status: 400 });
        }
        const videoId = urlMatch[1];

        const { data, error } = await supabase
            .from('videos')
            .insert({
                id: videoId,  // Use PeerTube ID as primary key
                title,
                description,
                peertube_url,
                course_id,
                teacher_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("VIDEO_METADATA_SAVE_ERROR:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}

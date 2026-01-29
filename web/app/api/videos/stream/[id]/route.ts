import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check user authentication and approval
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_approved, role')
            .eq('id', user.id)
            .single();

        if (!profile?.is_approved) {
            return NextResponse.json({ error: "Account pending approval" }, { status: 403 });
        }

        // 2. Fetch video metadata
        // RLS will ensure the user can only see this if enrolled or teacher
        const { data: video, error } = await supabase
            .from('videos')
            .select('peertube_url, title')
            .eq('id', id)
            .single();

        if (error || !video) {
            return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
        }

        // 3. Security Layer: Return a "Clean" URL for embedding
        // Convert watch URL (http://127.0.0.1:9000/w/ID) to embed URL
        // PeerTube embed format: http://127.0.0.1:9000/videos/embed/ID

        const videoIdMatch = video.peertube_url.match(/\/w\/([a-zA-Z0-9_-]+)/);
        if (!videoIdMatch) {
            return NextResponse.json({ error: "Invalid PeerTube URL format" }, { status: 500 });
        }

        const peertubeId = videoIdMatch[1];
        const peertubeBaseUrl = video.peertube_url.split('/w/')[0]; // Get http://127.0.0.1:9000
        const embedUrl = `${peertubeBaseUrl}/videos/embed/${peertubeId}`;

        return NextResponse.json({
            stream_url: embedUrl,
            title: video.title,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error("VIDEO_PROXY_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

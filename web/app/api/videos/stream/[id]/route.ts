import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Check Firebase session
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminClient = createAdminClient();

        const { data: profile } = await adminClient
            .from('profiles')
            .select('is_approved, role')
            .eq('id', session.uid)
            .single();

        if (!profile?.is_approved) {
            return NextResponse.json({ error: "Account pending approval" }, { status: 403 });
        }

        // 2. Fetch video metadata
        // We use adminClient to bypass RLS since we've already verified the session
        const { data: video, error } = await adminClient
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

        // Use the public PeerTube URL from environment if available, 
        // this fixes issues where the stored URL has a wrong port (e.g. 9001) 
        // or uses an internal Docker hostname (e.g. http://peertube:9000)
        const peertubeBaseUrl = process.env.NEXT_PUBLIC_PEERTUBE_URL ?
            process.env.NEXT_PUBLIC_PEERTUBE_URL.replace(/\/$/, "") :
            video.peertube_url.split('/w/')[0].replace(/\/$/, "");

        const embedUrl = `${peertubeBaseUrl}/videos/embed/${peertubeId}`;

        return NextResponse.json({
            stream_url: embedUrl,
            title: video.title,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error("❌ VIDEO_PROXY_ERROR:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            id: (await params).id
        });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

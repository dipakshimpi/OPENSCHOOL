import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Check Keycloak session via NextAuth
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminClient = createAdminClient();

        // 2. Fetch user profile
        const { data: profile } = await adminClient
            .from('profiles')
            .select('is_approved, role')
            .eq('id', session.uid)
            .single();

        if (!profile?.is_approved) {
            return NextResponse.json({ error: "Account pending approval" }, { status: 403 });
        }

        // 3. Fetch video metadata
        const { data: video, error } = await adminClient
            .from('videos')
            .select('video_url, title, course_id, teacher_id')
            .eq('id', id)
            .single();

        if (error || !video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // 4. Enrollment access control
        const isAdmin = profile.role === 'admin';
        const isTeacher = video.teacher_id === session.uid;

        if (!isAdmin && !isTeacher) {
            const { data: enrollment } = await adminClient
                .from('enrollments')
                .select('id')
                .eq('student_id', session.uid)
                .eq('course_id', video.course_id)
                .single();

            if (!enrollment) {
                return NextResponse.json({ error: "Access denied. You must be enrolled in this course to watch this video." }, { status: 403 });
            }
        }

        // 5. Security Layer: Use VideoService to generate the Signed Proxy URL
        const { VideoService } = await import("@/lib/video-service");

        // Extract Stream ID (remove 'ams:' prefix if it exists)
        const streamId = video.video_url.replace('ams:', '');

        // 🛡️ SMART PROXY: Generate a local signed path for Enterprise-level security 
        // on a Community Edition server.
        const secureProxyUrl = VideoService.getProxyUrl(streamId, session.uid);

        return NextResponse.json({
            stream_url: secureProxyUrl,
            title: video.title,
            timestamp: Date.now(),
            provider: 'antmedia'
        });

    } catch (error) {
        console.error("❌ VIDEO_PROXY_ERROR:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

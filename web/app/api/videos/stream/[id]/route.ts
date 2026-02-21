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

        // 3. Fetch video metadata (includes course_id and teacher_id for access check)
        const { data: video, error } = await adminClient
            .from('videos')
            .select('peertube_url, title, course_id, teacher_id')
            .eq('id', id)
            .single();

        if (error || !video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // 4. 🔒 CRITICAL: Enrollment-based access control
        // Allow access if:
        //   a) User is admin
        //   b) User is the teacher who uploaded this video
        //   c) User is enrolled in the video's course
        const isAdmin = profile.role === 'admin';
        const isTeacher = video.teacher_id === session.uid;

        if (!isAdmin && !isTeacher) {
            // Check enrollment
            const { data: enrollment } = await adminClient
                .from('enrollments')
                .select('id')
                .eq('student_id', session.uid)
                .eq('course_id', video.course_id)
                .single();

            if (!enrollment) {
                console.warn(`🚫 Access denied: User ${session.uid} not enrolled in course ${video.course_id} for video ${id}`);
                return NextResponse.json({ error: "Access denied. You must be enrolled in this course to watch this video." }, { status: 403 });
            }
        }

        // 5. Security Layer: Use VideoService to generate the AMS URL
        const { VideoService } = await import("@/lib/video-service");

        // Extract Stream ID (remove 'ams:' prefix if it exists)
        const streamId = video.peertube_url.replace('ams:', '');
        const streamUrl = await VideoService.getStreamUrl(streamId);

        return NextResponse.json({
            stream_url: streamUrl,
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

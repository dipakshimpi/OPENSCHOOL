import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminClient = createAdminClient();

        // 1. Check authentication via verifySession (Identity Bridge)
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch video to check ownership
        const { data: video, error: fetchError } = await adminClient
            .from('videos')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || !video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // 3. Fetch user role from profile
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', session.uid)
            .single();

        const isAdmin = profile?.role === 'admin';
        const isOwner = video.teacher_id === session.uid;

        if (!isAdmin && !isOwner) {
            console.warn(`🚫 Deletion denied: User ${session.uid} is not owner of video ${id}`);
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 4. Delete the video metadata from database
        const { error: deleteError } = await adminClient
            .from('videos')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error("❌ Delete operation failed:", deleteError);
            throw deleteError;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE_VIDEO_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Fetch video to check ownership
        const { data: video, error: fetchError } = await supabase
            .from('videos')
            .select('teacher_id')
            .eq('id', id)
            .single();

        if (fetchError || !video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // 3. Check if user is the teacher who uploaded the video or an admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.role === 'admin';
        const isOwner = video.teacher_id === user.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 4. Delete the video
        const { error: deleteError } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE_VIDEO_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

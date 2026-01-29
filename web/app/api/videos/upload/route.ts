import { createClient } from "@/lib/supabase/server";
import { uploadToPeerTube } from "@/lib/peertube";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        console.log("🚀 Starting Video Upload Process...");

        // 1. Authenticate User
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
            return NextResponse.json({ error: "Forbidden: Only teachers can upload videos" }, { status: 403 });
        }

        // DEBUG: Check Request Headers
        const contentType = request.headers.get("content-type") || "";
        const contentLength = request.headers.get("content-length") || "0";
        console.log(`📡 Incoming Request: ${request.method} | Type: ${contentType} | Size: ${contentLength} bytes`);

        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json({ error: "Invalid Content-Type. Must be multipart/form-data." }, { status: 400 });
        }

        // 2. Parse Form Data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const courseId = formData.get("courseId") as string;

        if (!file || !title || !courseId) {
            return NextResponse.json({ error: "Missing required fields (file, title, courseId)" }, { status: 400 });
        }

        console.log(`📂 Received file: ${file.name} (${file.size} bytes) for Course: ${courseId}`);

        // 3. Upload to PeerTube (The "Magic" Step)
        // This runs on the server, so the teacher's browser isn't uploading to PeerTube directly.
        // The file goes Browser -> Next.js Server -> PeerTube Server.
        let peerTubeVideo;
        try {
            peerTubeVideo = await uploadToPeerTube(file, title, description || "");
        } catch (uploadError: any) {
            console.error("❌ PeerTube Upload Failed:", uploadError);
            return NextResponse.json({ error: `PeerTube Error: ${uploadError.message}` }, { status: 502 });
        }

        console.log("✅ PeerTube Upload Success. ID:", peerTubeVideo.shortUUID);

        // 4. Save Metadata to Database
        // We use the PeerTube ID as the primary key or just store it in the URL field
        // Our schema uses 'id' (TEXT) as primary key, which matches PeerTube's UUID or ShortUUID
        const { data: videoRecord, error: dbError } = await supabase
            .from("videos")
            .insert({
                id: peerTubeVideo.shortUUID, // Using PeerTube ID as our ID
                course_id: courseId,
                teacher_id: user.id,
                title: title,
                description: description || "",
                url: peerTubeVideo.url, // Store the full URL/Link
            })
            .select()
            .single();

        if (dbError) {
            console.error("❌ Database Insert Failed:", dbError);
            // Optional: Try to delete the video from PeerTube if DB fails to keep consistency?
            // For now, let's just error out.
            return NextResponse.json({ error: "Database Error: " + dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, video: videoRecord });

    } catch (error: any) {
        console.error("💥 Critical Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}

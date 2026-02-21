import { createClient } from "@/lib/supabase/server";
import { VideoService } from "@/lib/video-service";
import { NextResponse, NextRequest } from "next/server";
import { videoSchema } from "@/lib/validations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: NextRequest) {
    try {
        console.log("🚀 Starting Ant Media Video Upload Process (API)...");

        // 1. Authenticate User via NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (session.user.role !== "teacher" && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Only teachers can upload videos" }, { status: 403 });
        }

        // 2. Parse and Validate Form Data
        const formData = await request.formData();
        const file = formData.get("file") as File;

        const result = videoSchema.safeParse({
            title: formData.get("title"),
            description: formData.get("description"),
            courseId: formData.get("courseId"),
        });

        if (!result.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: result.error.format()
            }, { status: 400 });
        }

        if (!file) {
            return NextResponse.json({ error: "Missing required field: file" }, { status: 400 });
        }

        const { title, description, courseId } = result.data;

        // 3. Upload to Ant Media Server
        let uploadedVideo;
        try {
            uploadedVideo = await VideoService.upload(file, title, description || "");
        } catch (uploadError: unknown) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown AMS Error";
            console.error("❌ AMS Upload Failed:", uploadError);
            return NextResponse.json({ error: `Ant Media Error: ${errorMessage}` }, { status: 502 });
        }

        // 4. Save Metadata to Database
        const supabase = await createClient();
        const { data: videoRecord, error: dbError } = await supabase
            .from("videos")
            .insert({
                id: uploadedVideo.id, // Stream ID
                course_id: courseId,
                teacher_id: session.user.id,
                title: title,
                description: description || "",
                peertube_url: uploadedVideo.url,
            })
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ error: "Database Error: " + dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, video: videoRecord });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown Error";
        return NextResponse.json({ error: "Internal Server Error: " + errorMessage }, { status: 500 });
    }
}

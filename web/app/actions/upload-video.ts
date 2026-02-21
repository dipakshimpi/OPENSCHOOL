"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { VideoService } from "@/lib/video-service";

export async function uploadVideoAction(formData: FormData) {
    try {
        console.log("🚀 Starting Server Action: Video Upload");

        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const courseId = formData.get("courseId") as string;

        if (!file || !title || !courseId) {
            return { error: "Missing required fields" };
        }

        console.log(`📂 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        // 1. Authenticate via NextAuth (Keycloak)
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            console.warn("❌ Upload Attempt: Unauthorized");
            return { error: "Unauthorized" };
        }

        console.log(`👤 User: ${session.user.email} (ID: ${session.user.id}, Role: ${session.user.role})`);

        if (session.user.role !== "teacher" && session.user.role !== "admin") {
            console.warn(`❌ Upload Attempt: Forbidden (Role: ${session.user.role})`);
            return { error: "Forbidden" };
        }

        const supabase = await createClient();

        // 2. Upload using VideoService (Provider-Aware)
        let uploadedVideo;
        try {
            console.log("📤 Sending to VideoService...");
            uploadedVideo = await VideoService.upload(file, title, description || "");
            console.log("✅ VideoService Upload Success:", uploadedVideo.id);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Upload Error";
            console.error("❌ Video Upload Error Detail:", error);
            return { error: `Upload Failed: ${errorMessage}` };
        }

        // 3. Save to Supabase
        const { error: dbError } = await supabase
            .from("videos")
            .insert({
                id: uploadedVideo.id,
                course_id: courseId,
                teacher_id: session.user.id,
                title: title,
                description: description || "",
                peertube_url: uploadedVideo.url,
            });

        if (dbError) {
            console.error("DB Error:", dbError);
            return { error: "Failed to save video metadata" };
        }

        return { success: true };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown Error";
        console.error("Server Action Error:", error);
        return { error: errorMessage };
    }
}

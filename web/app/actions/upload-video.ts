"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadToPeerTube } from "@/lib/peertube";

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

        // 1. Authenticate
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
            return { error: "Forbidden" };
        }

        // 2. Upload to PeerTube
        let peerTubeVideo;
        try {
            peerTubeVideo = await uploadToPeerTube(file, title, description || "");
        } catch (error: any) {
            console.error("PeerTube Error:", error);
            return { error: `PeerTube Upload Failed: ${error.message}` };
        }

        // 3. Save to Supabase
        const { error: dbError } = await supabase
            .from("videos")
            .insert({
                id: peerTubeVideo.shortUUID,
                course_id: courseId,
                teacher_id: user.id,
                title: title,
                description: description || "",
                peertube_url: peerTubeVideo.url,
            });

        if (dbError) {
            console.error("DB Error:", dbError);
            return { error: "Failed to save video metadata" };
        }

        return { success: true };

    } catch (error: any) {
        console.error("Server Action Error:", error);
        return { error: error.message };
    }
}

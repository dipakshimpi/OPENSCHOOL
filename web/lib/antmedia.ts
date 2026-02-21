const AMS_URL = process.env.ANT_MEDIA_API_URL || "http://localhost:5080";
const APP_NAME = process.env.ANT_MEDIA_APP_NAME || "LiveApp";

/**
 * Uploads a video file to Ant Media Server (converted to VOD)
 */
export async function uploadToAntMedia(file: File, name: string, description: string): Promise<{ streamId: string }> {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description || "");

        // Ant Media Server VOD upload endpoint: /rest/v2/vods/create
        // Usually requires no auth by default in Community Edition, or a REST Token if configured
        console.log(`📤 Uploading to AMS (${APP_NAME}): ${name}`);
        const url = `${AMS_URL}/rest/v2/vods/create?name=${encodeURIComponent(name)}`;

        const response = await fetch(url, {
            method: "POST",
            body: formData,
            // Add Authorization header if ANT_MEDIA_REST_TOKEN is provided
            ...(process.env.ANT_MEDIA_REST_TOKEN && {
                headers: {
                    "Authorization": process.env.ANT_MEDIA_REST_TOKEN
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ant Media Upload Failed: ${errText}`);
        }

        const data = await response.json();

        // Ant Media returns { success: true, message: "...", streamId: "..." }
        if (!data.success) {
            throw new Error(data.message || "Ant Media indicated failure");
        }

        return {
            streamId: data.streamId
        };

    } catch (error: unknown) {
        console.error("Ant Media Upload Error:", error);
        throw error;
    }
}

/**
 * Generates a Playback Token (Enterprise Edition only, but good to have stubs)
 */
export async function getAMSPlaybackToken(streamId: string): Promise<string | null> {
    // In Community Edition, tokens aren't typically used. 
    // In Enterprise, you'd call /rest/v2/devices/get-token or similar for streamId
    console.log(`🎟️ Token requested for stream: ${streamId} (Stub)`);
    return null;
}

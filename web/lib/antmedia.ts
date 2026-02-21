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
        // Sanitize name for AMS and preserve extension
        const extension = file.name.split('.').pop() || 'mp4';
        const baseName = name.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 40);
        const safeName = `${baseName}.${extension}`;

        // Ant Media Server VOD upload endpoint: /{APP_NAME}/rest/v2/vods/create
        console.log(`📤 Uploading to AMS (${APP_NAME}): ${safeName} (Original: ${name.substring(0, 20)}...)`);
        const url = `${AMS_URL}/${APP_NAME}/rest/v2/vods/create?name=${encodeURIComponent(safeName)}`;

        let response;
        try {
            response = await fetch(url, {
                method: "POST",
                body: formData,
                headers: {
                    ...(process.env.ANT_MEDIA_REST_TOKEN && {
                        "Authorization": process.env.ANT_MEDIA_REST_TOKEN
                    })
                }
            });
        } catch (fetchErr) {
            console.error("📡 Network Error connecting to AMS:", fetchErr);
            throw new Error(`Could not connect to Ant Media Server at ${AMS_URL}. Is it running?`);
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error("❌ AMS Response Error:", response.status, errText);
            throw new Error(`Ant Media Upload Failed (${response.status}): ${errText}`);
        }

        const data = await response.json();
        console.log("📥 AMS Response Data:", data);

        // Ant Media returns { success: true, message: "...", dataId: "...", streamId: "..." }
        if (!data.success) {
            throw new Error(data.message || "Ant Media indicated failure");
        }

        // Community Edition VOD API often returns ID in dataId or message
        const finalStreamId = data.streamId || data.dataId || data.message;

        if (!finalStreamId) {
            throw new Error("Ant Media succeeded but returned no Stream ID");
        }

        return {
            streamId: finalStreamId
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
/**
 * Checks if Ant Media Server is reachable and healthy
 */
export async function isAntMediaAvailable(): Promise<boolean> {
    try {
        const url = `${AMS_URL}/${APP_NAME}/rest/v2/version`;
        const response = await fetch(url, {
            signal: AbortSignal.timeout(3000), // 3s timeout
            headers: {
                ...(process.env.ANT_MEDIA_REST_TOKEN && {
                    "Authorization": process.env.ANT_MEDIA_REST_TOKEN
                })
            }
        });
        return response.ok;
    } catch (error) {
        console.error("📡 Ant Media Health Check Failed:", error);
        return false;
    }
}

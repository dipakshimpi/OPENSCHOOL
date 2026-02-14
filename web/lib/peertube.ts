const PEERTUBE_URL = process.env.PEERTUBE_API_URL || "http://localhost:9000";
const USERNAME = process.env.PEERTUBE_ADMIN_USER || "root";
const PASSWORD = process.env.PEERTUBE_ADMIN_PASSWORD || "password";

interface AuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

/**
 * Check if PeerTube server is available
 */
export async function isPeerTubeAvailable(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${PEERTUBE_URL}/api/v1/config`, {
            signal: controller.signal,
            headers: { "ngrok-skip-browser-warning": "true" }
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.warn("⚠️ PeerTube health check failed:", error instanceof Error ? error.message : String(error));
        return false;
    }
}

/**
 * Authenticates with PeerTube and returns an access token.
 * This effectively acts as the "Service Account" login.
 */
export async function getPeerTubeToken(): Promise<string> {
    try {
        // First check if PeerTube is available
        const isAvailable = await isPeerTubeAvailable();
        if (!isAvailable) {
            throw new Error("Video Server is currently unavailable. Please contact your administrator.");
        }

        let clientId = process.env.PEERTUBE_CLIENT_ID;
        let clientSecret = process.env.PEERTUBE_CLIENT_SECRET;

        // 1. Get Client ID and Secret (Only if not provided in env)
        if (!clientId || !clientSecret) {
            const clientRes = await fetch(`${PEERTUBE_URL}/api/v1/oauth-clients/local`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            if (!clientRes.ok) {
                const errText = await clientRes.text();
                throw new Error(`Failed to fetch PeerTube OAuth client info: ${errText}. Try adding PEERTUBE_CLIENT_ID/SECRET to env.`);
            }
            const clientData = await clientRes.json();
            clientId = clientData.client_id;
            clientSecret = clientData.client_secret;
        }

        // 2. Request Token
        const tokenRes = await fetch(`${PEERTUBE_URL}/api/v1/users/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "ngrok-skip-browser-warning": "true"
            },
            body: new URLSearchParams({
                client_id: clientId!,
                client_secret: clientSecret!,
                grant_type: "password",
                username: USERNAME,
                password: PASSWORD,
            }),
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            throw new Error(`PeerTube Login Failed: ${err}`);
        }

        const tokenData: AuthToken = await tokenRes.json();
        return tokenData.access_token;

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
            console.error("❌ PeerTube Server is DOWN at", PEERTUBE_URL);
            throw new Error("Video Server is currently offline. Please try again later or contact support.");
        }
        console.error("PeerTube Auth Error:", error);
        throw error;
    }
}

/**
 * Uploads a video file to PeerTube.
 * Note: Since we are in a Next.js API route receiving FormData, 
 * we will forward the file buffer to PeerTube.
 */
export async function uploadToPeerTube(file: File, name: string, description: string): Promise<{ shortUUID: string, url: string }> {
    const token = await getPeerTubeToken();

    // Prepare FormData for PeerTube
    const formData = new FormData();
    formData.append("videofile", file);
    formData.append("channelId", "1"); // Default channel ID, commonly 1 for the main admin channel
    formData.append("name", name);
    formData.append("privacy", "1"); // 1 = Private (so only our app can show it)
    if (description) formData.append("description", description);

    const uploadRes = await fetch(`${PEERTUBE_URL}/api/v1/videos/upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        },
        body: formData,
    });

    if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: "Unknown error" }));
        console.error("PeerTube Upload Failed Details:", err);
        throw new Error(err.error || "Unknown PeerTube Upload Error");
    }

    const data = await uploadRes.json();
    const peertubePublicUrl = process.env.NEXT_PUBLIC_PEERTUBE_URL || PEERTUBE_URL;
    return {
        shortUUID: data.video.shortUUID,
        url: data.video.url || `${peertubePublicUrl}/w/${data.video.shortUUID}`
    };
}



const PEERTUBE_URL = process.env.PEERTUBE_API_URL || "http://127.0.0.1:9000";
const USERNAME = process.env.PEERTUBE_ADMIN_USER || "root";
const PASSWORD = process.env.PEERTUBE_ADMIN_PASSWORD || "password";

interface AuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

/**
 * Authenticates with PeerTube and returns an access token.
 * This effectively acts as the "Service Account" login.
 */
export async function getPeerTubeToken(): Promise<string> {
    try {
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

    } catch (error) {
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
    return {
        shortUUID: data.video.shortUUID,
        url: data.video.url || `${PEERTUBE_URL}/w/${data.video.shortUUID}`
    };
}

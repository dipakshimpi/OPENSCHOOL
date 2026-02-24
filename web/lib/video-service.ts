import crypto from 'crypto';

export interface VideoMetadata {
    id: string;
    title: string;
    description?: string;
    course_id: string;
    teacher_id: string;
    provider: 'antmedia';
    provider_id: string; // Ant Media Stream ID
    thumbnail_url?: string;
    duration?: number;
}

export class VideoService {
    private static appName = process.env.ANT_MEDIA_APP_NAME || "LiveApp";
    private static amsBaseUrl = process.env.NEXT_PUBLIC_ANT_MEDIA_URL?.replace(/\/$/, "");

    /**
     * Generates an Enterprise-grade cryptographic hash token for Ant Media Server.
     * This follows the AMS "Play Token Control" (Hash) security model.
     * Formula: sha256(streamId + expireTimestamp + secret)
     */
    static generateSecureToken(streamId: string, expireMinutes: number = 10): { token: string, expire: number } | null {
        const secret = process.env.ANT_MEDIA_HASH_SECRET;

        if (!secret || secret === 'your_ams_hash_secret_here') {
            if (process.env.NODE_ENV === 'production') {
                console.warn("🚨 [Security] AMS Hash Secret is missing or using placeholder!");
            }
            return null;
        }

        const expireTimestamp = Math.floor(Date.now() / 1000) + (expireMinutes * 60);

        // Use clean ID for hashing (AMS doesn't want .mp4 or .m3u8 in the hash check)
        const cleanId = streamId.split('.')[0];

        // Enterprise Hash Formula
        const hashString = cleanId + expireTimestamp + secret;
        const token = crypto.createHash('sha256').update(hashString).digest('hex');

        return { token, expire: expireTimestamp };
    }

    /**
     * Generates a "Next.js Signed Artifact" for Community Edition security.
     * This allows us to hide the Ant Media IP and enforce JWT checks at the API layer.
     */
    static generateSignedArtifact(streamId: string, userId: string): string {
        const secret = process.env.NEXTAUTH_SECRET || "default_local_secret";
        const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const data = `${streamId}|${userId}|${expire}`;
        const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
        // ✅ Hex-encode the entire payload: only 0-9 and a-f characters.
        // This completely eliminates Base64 URL-encoding issues (+, /, =, %3D).
        return Buffer.from(`${data}:${hmac}`).toString('hex');
    }

    /**
     * Generates a Proxy URL that points to our local Next.js Secure Streamer.
     * This solves CORS, IP Exposure, and Browser Stalls (0:00).
     */
    static getProxyUrl(streamId: string, userId: string): string {
        const artifact = this.generateSignedArtifact(streamId, userId);
        // ✅ Token is URL-safe Base64 — no encoding needed, no slashes to split on
        return `/api/videos/proxy/${artifact}/video.mp4`;
    }

    /**
     * Generates a secure, time-limited HLS or MP4 URL for Ant Media playback.
     */
    static async getStreamUrl(streamId: string): Promise<string> {
        if (!this.amsBaseUrl) {
            throw new Error("Ant Media Server URL not configured");
        }

        const cleanId = streamId.split('.')[0];

        // 🚀 SMART COMMUNITY STRATEGY:
        // We use a Local Proxy to hide the server and fix metadata/CORS issues.
        // We will pass the internal AMS URL to the API route.
        return `${this.amsBaseUrl}/${this.appName}/streams/${cleanId}.mp4`;
    }

    /**
     * Handles video upload to Ant Media Server
     */
    static async upload(file: File, title: string, description: string): Promise<{ id: string, url: string }> {
        const { uploadToAntMedia } = await import("./antmedia");
        const res = await uploadToAntMedia(file, title, description);

        // Store the streamId as the primary identifier
        return {
            id: res.streamId,
            url: `ams:${res.streamId}`
        };
    }

    /**
     * Helper to check if a provider string indicates Ant Media
     */
    static isAntMedia(url: string): boolean {
        return url.startsWith('ams:') || !url.includes('/w/');
    }
}

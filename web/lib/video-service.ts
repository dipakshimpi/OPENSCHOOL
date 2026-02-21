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
     * Generates a secure, potentially tokenized stream URL for Ant Media
     */
    static async getStreamUrl(streamId: string): Promise<string> {
        if (!this.amsBaseUrl) {
            throw new Error("Ant Media Server URL not configured");
        }

        // FUTURE: call Ant Media REST API to generate a playback token here
        // const token = await getAMSPlaybackToken(streamId);

        // For now, using the secure play.html provided by AMS
        return `${this.amsBaseUrl}/${this.appName}/play.html?name=${streamId}&autoplay=true`;
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

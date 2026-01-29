"use server";

import { getPeerTubeToken } from "@/lib/peertube";

export async function getUploadToken() {
    try {
        const token = await getPeerTubeToken();
        return { token };
    } catch (error) {
        console.error("Failed to get PeerTube token:", error);
        return { error: "Failed to authenticate with Video Server" };
    }
}

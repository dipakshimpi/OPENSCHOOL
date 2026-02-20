"use server";

import { getPeerTubeToken } from "@/lib/peertube";
import { verifySession } from "@/lib/auth-utils";

export async function getUploadToken() {
    try {
        const session = await verifySession();
        if (!session) return { error: "Unauthorized" };

        const token = await getPeerTubeToken();
        return { token };
    } catch (error) {
        console.error("Failed to get PeerTube token:", error);
        return { error: `Failed to authenticate with Video Server: ${error instanceof Error ? error.message : String(error)}` };
    }
}

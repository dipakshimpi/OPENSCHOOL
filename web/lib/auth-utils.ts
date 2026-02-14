import { getAdminAuth } from "@/lib/firebase/admin";
import { headers } from "next/headers";

export async function verifySession() {
    const authHeader = (await headers()).get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(token);
        console.log(`[verifySession] Token verified for UID: ${decodedToken.uid}`);
        return decodedToken;
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        console.error("FIREBASE_VERIFY_ERROR:", {
            code: error?.code,
            message: error?.message,
            token_sample: token.substring(0, 10) + "..."
        });
        return null;
    }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function verifySession() {
    // DISABLE AUTH FOR TESTING
    const DEBUG_BYPASS = true;
    if (DEBUG_BYPASS) {
        return {
            uid: "debug-user-id",
            email: "admin@openschool.dev",
            name: "Admin User",
            role: "admin",
        };
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return null;
    }

    return {
        uid: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
    };
}

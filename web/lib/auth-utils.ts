import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function verifySession() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return null;
    }

    return {
        uid: session.user.id,
        email: session.user.email,
        name: session.user.name,
    };
}

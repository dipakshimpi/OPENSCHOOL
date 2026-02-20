import { SignJWT } from "jose";

export async function createSupabaseToken(userId: string, role: string = "authenticated") {
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
        console.error("Missing SUPABASE_JWT_SECRET in environment variables");
        return null;
    }

    try {
        const encodedSecret = new TextEncoder().encode(secret);

        // Supabase expects a JWT with:
        // - aud: "authenticated"
        // - role: "authenticated" (or service_role)
        // - sub: the user's UUID
        // - exp: expiration time
        const token = await new SignJWT({
            role: "authenticated",
            sub: userId,
            user_role: role, // Custom claim to track if they are admin/teacher/student
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setAudience("authenticated")
            .setExpirationTime("24h")
            .sign(encodedSecret);

        return token;
    } catch (error) {
        console.error("Error signing Supabase JWT:", error);
        return null;
    }
}

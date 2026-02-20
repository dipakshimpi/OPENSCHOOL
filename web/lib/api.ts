import { getSession } from "next-auth/react";

export async function authedFetch(url: string, options: RequestInit = {}) {
    const session = await getSession();
    const user = session?.user;

    console.log(`[authedFetch] Calling ${url}, user present: ${!!user}`);

    if (session) {
        try {
            // NextAuth stores the token in the session typically (if we config it that way)
            // Or we can just use the cookie which NextAuth manages automatically for same-origin requests.
            // However, our API might expect a Bearer token.
            const headers = new Headers(options.headers || {});
            // In a real prod setup with NextAuth, the session cookie handles auth for /api routes usually.
            // But if we need an explicit token for a separate backend, we'd put it here.
            options.headers = headers;
        } catch (tokenErr) {
            console.error(`[authedFetch] Token logic error for ${url}:`, tokenErr);
        }
    }

    return fetch(url, options);
}

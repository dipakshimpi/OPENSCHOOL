import { auth } from "./firebase/client";

export async function authedFetch(url: string, options: RequestInit = {}) {
    // Wait for the auth state to initialize (prevents null currentUser on page load)
    if (auth.authStateReady) {
        await auth.authStateReady();
    }

    const user = auth.currentUser;
    console.log(`[authedFetch] Calling ${url}, user present: ${!!user}`);

    if (user) {
        try {
            const token = await user.getIdToken();
            const headers = new Headers(options.headers || {});
            headers.set("Authorization", `Bearer ${token}`);
            options.headers = headers;
            console.log(`[authedFetch] Token attached for ${url}`);
        } catch (tokenErr) {
            console.error(`[authedFetch] Failed to get token for ${url}:`, tokenErr);
        }
    } else {
        console.warn(`[authedFetch] No user found for ${url}, request may be unauthorized.`);
    }

    return fetch(url, options);
}

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// SET THIS TO 'true' TO SKIP AUTHENTICATION COMPLETELY FOR TESTING
const DISABLE_AUTH = true;

const MOCK_SESSION = {
    user: {
        id: "debug-user-id",
        name: "Admin User",
        email: "admin@openschool.dev",
        role: "admin", // Default role
        image: null,
    },
    expires: "2099-01-01T00:00:00.000Z",
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
    if (DISABLE_AUTH) {
        return (
            <NextAuthSessionProvider session={MOCK_SESSION as any /* eslint-disable-line @typescript-eslint/no-explicit-any */}>
                {children}
            </NextAuthSessionProvider>
        );
    }

    return (
        <NextAuthSessionProvider>
            {children}
        </NextAuthSessionProvider>
    );
}

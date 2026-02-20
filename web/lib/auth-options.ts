import { NextAuthOptions, DefaultSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession["user"]
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        // 1. Google Login (Headless - we still use redirect but with direct IDP hint)
        KeycloakProvider({
            id: "keycloak-google",
            name: "Google",
            clientId: process.env.KEYCLOAK_CLIENT_ID!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
            issuer: process.env.KEYCLOAK_ISSUER!,
            authorization: {
                params: {
                    scope: "openid email profile",
                    kc_idp_hint: "google"
                }
            }
        }),
        // 2. Custom Email/Password Login (Stay in OpenSchool UI)
        CredentialsProvider({
            id: "credentials",
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    // Talk directly to Keycloak's token endpoint
                    const tokenURL = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
                    const response = await fetch(tokenURL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            grant_type: 'password',
                            client_id: process.env.KEYCLOAK_CLIENT_ID!,
                            client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
                            username: credentials.email,
                            password: credentials.password,
                            scope: 'openid profile email'
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        console.error("❌ Keycloak Login Failed:", {
                            status: response.status,
                            error: errorData.error,
                            description: errorData.error_description
                        });
                        return null;
                    }

                    const data = await response.json();
                    console.log("✅ Keycloak Login Success for:", credentials.email);

                    // Decode the access token to get user info
                    const decoded: any = jwtDecode(data.access_token);

                    return {
                        id: decoded.sub,
                        email: decoded.email,
                        name: decoded.name || decoded.preferred_username,
                    };
                } catch (error) {
                    console.error("Authorize Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

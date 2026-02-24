import { NextAuthOptions, DefaultSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import { createSupabaseToken } from "./supabase-token";
import { createClient } from "@supabase/supabase-js";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role?: string;
        } & DefaultSession["user"];
        supabaseAccessToken?: string;
    }
}

interface KeycloakToken {
    sub: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    [key: string]: unknown;
}

export const authOptions: NextAuthOptions = {
    providers: [
        // 1. Google Login (Headless)
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
        // 2. Custom Email/Password Login
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
                    const decoded = jwtDecode<KeycloakToken>(data.access_token);

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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;

                // 🏢 Fetch user role from Supabase to bake it into the JWT
                try {
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SERVICE_SUPABASESERVICE_KEY!
                    );

                    // 1. Try to find existing profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        token.role = profile.role;

                        // 🔐 MASTER ADMIN SAFETY NET: 
                        // If this is the master admin email, ensure they get the admin role 
                        // regardless of what the database says (e.g. if they were testing student flow)
                        if (user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
                            token.role = 'admin';
                        }
                    } else {
                        // 2. If no profile exists, check if this is the FIRST user in the system
                        const { count } = await supabase
                            .from('profiles')
                            .select('*', { count: 'exact', head: true });

                        const isFirstUser = count === 0;
                        const initialRole = isFirstUser ? 'admin' : 'student';

                        // 3. Create the profile automatically
                        await supabase
                            .from('profiles')
                            .insert({
                                id: user.id,
                                email: user.email,
                                role: initialRole,
                                full_name: user.name
                            });

                        token.role = initialRole;
                    }
                } catch {
                    token.role = 'student';
                }

                // 🛡️ Sign the Supabase JWT
                const supabaseToken = await createSupabaseToken(user.id, token.role as string);
                if (supabaseToken) {
                    token.supabaseAccessToken = supabaseToken;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.supabaseAccessToken = token.supabaseAccessToken as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

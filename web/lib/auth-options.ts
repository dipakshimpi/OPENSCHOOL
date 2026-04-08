import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role?: string;
        } & DefaultSession["user"];
    }
}

function getSupabaseAdmin() {
    return createClient(
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_SUPABASESERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export const authOptions: NextAuthOptions = {
    providers: [
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
                    const supabase = getSupabaseAdmin();

                    // Look up user in profiles table by email
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, email, full_name, role')
                        .eq('email', credentials.email.toLowerCase())
                        .single();

                    if (profile) {
                        return {
                            id: profile.id,
                            email: profile.email,
                            name: profile.full_name,
                        };
                    }

                    // Auto-create profile if not found (dev mode)
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true });

                    const isFirstUser = count === 0;
                    const role = isFirstUser ? 'admin' : 'student';

                    const { data: newProfile } = await supabase
                        .from('profiles')
                        .insert({
                            email: credentials.email.toLowerCase(),
                            full_name: credentials.email.split('@')[0],
                            role,
                            is_approved: true,
                            is_admin_approved: true,
                        })
                        .select('id, email, full_name')
                        .single();

                    if (newProfile) {
                        return {
                            id: newProfile.id,
                            email: newProfile.email,
                            name: newProfile.full_name,
                        };
                    }

                    return null;
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

                try {
                    const supabase = getSupabaseAdmin();
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    token.role = profile?.role || 'student';

                    if (user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
                        token.role = 'admin';
                    }
                } catch {
                    token.role = 'student';
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

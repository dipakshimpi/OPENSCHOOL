import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function createClient() {
    const cookieStore = await cookies()
    const session = await getServerSession(authOptions)

    // 🛡️ Get the signed Supabase token from our Identity Bridge
    const supabaseToken = session?.supabaseAccessToken

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
        {
            global: {
                headers: supabaseToken ? {
                    Authorization: `Bearer ${supabaseToken}`
                } : {}
            },
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch {
                        // Ignore if called from server component
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch {
                        // Ignore if called from server component
                    }
                },
            },
        }
    )
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 0. Initialize Rate Limiter (Optional: Only if env keys exist)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const ratelimit = redis ? new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "60 s"),
    analytics: true,
}) : null;

export async function proxy(request: NextRequest) {
    try {
        if (request.method === "POST" && request.headers.has("next-action")) {
            return NextResponse.next();
        }

        // 0. Apply Rate Limiting (With Developer Bypass)
        const isDeveloper = request.headers.get('x-developer-bypass') === 'true';

        if (ratelimit && !isDeveloper) {
            try {
                const identifier = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? "127.0.0.1";
                const { success } = await ratelimit.limit(identifier);
                if (!success) {
                    return new NextResponse("Too many requests. Please try again later.", { status: 429 });
                }
            } catch (rateLimitErr) {
                console.error("RATE_LIMIT_FETCH_FAILED:", rateLimitErr);
                // Continue despite rate limit failure to prevent app lock
            }
        }

        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        // Note: Auth is handled by NextAuth with Supabase credentials/Google OAuth.
        // Supabase session management via cookies is kept for compatibility.
        // API verifySession handles the core security using NextAuth sessions.

        return response;
    } catch (globalErr) {
        console.error("MIDDLEWARE_CRITICAL_ERROR:", globalErr);
        // Fallback to allowing request to prevent total site blackout if middleware fails
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - /api/videos/upload (bypass middleware for uploads)
         * - /api/videos/proxy (bypass middleware for performance)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/videos/upload|api/videos/proxy|teacher/videos/upload).*)',
    ],
}

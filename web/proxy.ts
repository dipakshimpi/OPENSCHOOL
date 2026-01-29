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
    if (request.method === "POST" && request.headers.has("next-action")) {
        return NextResponse.next();
    }

    // 0. Apply Rate Limiting (With Developer Bypass)
    const isDeveloper = request.headers.get('x-developer-bypass') === 'true';

    if (ratelimit && !isDeveloper) {
        const identifier = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? "127.0.0.1";
        const { success } = await ratelimit.limit(identifier);
        if (!success) {
            return new NextResponse("Too many requests. Please try again later.", { status: 429 });
        }
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
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

    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    const url = request.nextUrl.clone()

    // 2. Identify intended dashboard segment
    const isAccessingAdmin = url.pathname.startsWith('/admin')
    const isAccessingTeacher = url.pathname.startsWith('/teacher')
    const isAccessingStudent = url.pathname.startsWith('/student')
    const isAccessingDashboard = isAccessingAdmin || isAccessingTeacher || isAccessingStudent

    // 3. Handle Guest Access on Protected Routes
    if (!user && isAccessingDashboard) {
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // 4. Strong Role-Based Access Control (RBAC)
    if (user && isAccessingDashboard) {
        // Fetch real-time role and approval status from database for maximum security
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_approved')
            .eq('id', user.id)
            .single();

        const role = profile?.role || 'student';
        const isApproved = profile?.is_approved ?? false;

        // Block mismatching roles
        if (isAccessingAdmin && role !== 'admin') {
            url.pathname = `/${role}`
            return NextResponse.redirect(url)
        }

        // Handle teacher approval
        if (role === 'teacher' && !isApproved) {
            url.pathname = '/auth/pending'
            return NextResponse.redirect(url)
        }

        if (isAccessingTeacher && role !== 'teacher') {
            url.pathname = `/${role}`
            return NextResponse.redirect(url)
        }
        if (isAccessingStudent && role !== 'student') {
            url.pathname = `/${role}`
            return NextResponse.redirect(url)
        }
    }

    // 5. Check if unapproved teacher is trying to skip the pending page
    if (user && url.pathname === '/auth/pending') {
        const { data: profile } = await supabase.from('profiles').select('is_approved').eq('id', user.id).single();
        if (profile?.is_approved) {
            url.pathname = '/teacher'
            return NextResponse.redirect(url)
        }
    }

    // 5. Handle Auth Pages for Logged-In Users
    if (user && url.pathname.startsWith('/auth') && url.pathname !== '/auth/pending') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        const role = profile?.role || 'student';
        url.pathname = `/${role}`
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - /api/videos/upload (bypass middleware for uploads)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/videos/upload|teacher/videos/upload).*)',
    ],
}

import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validations";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";
import { isEmailAllowed } from "@/lib/user-roles";

export const dynamic = "force-dynamic";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_SUPABASESERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(url, key);
}

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session || !session.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const intendedRole = searchParams.get('intendedRole') || undefined;

        // Check allowlist
        const { allowed, role: allowedRole } = await isEmailAllowed(session.email, intendedRole);
        if (!allowed) {
            return NextResponse.json({ error: "Access denied. Your email is not on the institution allowlist." }, { status: 403 });
        }

        const userId = session.uid;
        const supabase = getSupabaseAdmin();

        // 1. Try to fetch existing profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        // 2. If missing, Auto-Heal (Create Profile)
        if (error && error.code === 'PGRST116') {
            console.log(`[Profile API] Profile missing for ${userId}. Auto-creating with service role...`);

            const is_admin = allowedRole === 'admin';
            const newProfileData = {
                id: userId,
                email: session.email,
                full_name: session.name || session.email.split('@')[0],
                role: allowedRole || 'student',
                is_approved: is_admin,
                is_admin_approved: is_admin,
                is_teacher_approved: is_admin,
                updated_at: new Date().toISOString()
            };

            const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .upsert(newProfileData)
                .select()
                .single();

            if (createError) {
                console.warn("[Profile API] Profile creation failed:", createError.message);
                // Return a graceful fallback instead of 500
                return NextResponse.json({
                    id: userId,
                    email: session.email,
                    full_name: session.name || 'User',
                    role: allowedRole || 'student',
                    is_approved: false,
                    _pending: true
                });
            }

            return NextResponse.json(createdProfile);
        }

        if (error) {
            console.error("[Profile API] Fetch error:", error.message);
            // Graceful fallback
            return NextResponse.json({
                id: userId,
                email: session.email,
                full_name: session.name || 'User',
                role: allowedRole || 'student',
                is_approved: false,
                _pending: true
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("GET_PROFILE_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.uid;

        const body = await request.json();

        // Validate input with Zod
        const result = profileSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: result.error.format()
            }, { status: 400 });
        }

        const { full_name, phone_number, bio, department, grade_level, address, avatar_url } = result.data;

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name,
                phone_number,
                bio,
                department,
                grade_level,
                address,
                avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("PATCH_PROFILE_ERROR:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

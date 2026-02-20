import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validations";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";
import { isEmailAllowed } from "@/lib/user-roles";

export const dynamic = "force-dynamic";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session || !session.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const intendedRole = searchParams.get('intendedRole') || undefined;

        // Check allowlist (passing the intended role from the client)
        const { allowed, role: allowedRole } = await isEmailAllowed(session.email, intendedRole);
        if (!allowed) {
            return NextResponse.json({ error: "Access denied. Your email is not on the institution allowlist." }, { status: 403 });
        }

        const userId = session.uid;
        const supabaseAdmin = getSupabaseAdmin();
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("SUPABASE_PROFILE_FETCH_ERROR:", {
                userId,
                error
            });

            if (error.code === 'PGRST116') {
                // AUTO-HEAL: Create profile with role from allowlist
                const is_admin = allowedRole === 'admin';

                const { data: newProfile, error: createError } = await supabaseAdmin
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: session.name || session.email.split('@')[0],
                        role: allowedRole || 'student',
                        // Safety: Admins are auto-approved. Others need manual approval.
                        is_approved: is_admin,
                        is_admin_approved: is_admin,
                        is_teacher_approved: is_admin,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                return NextResponse.json(newProfile);
            }
            throw error;
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

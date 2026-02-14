import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validations";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

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

export async function GET() {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
                error,
                code: error.code,
                message: error.message
            });

            if (error.code === 'PGRST116') {
                // AUTO-HEAL: If the user exists in Firebase but not in Supabase, create a profile.
                // This ensures nobody gets locked out during the transition.
                const supabaseAdmin = getSupabaseAdmin();
                const { data: newProfile, error: createError } = await supabaseAdmin
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: session.name || session.email?.split('@')[0] || 'New User',
                        role: 'student', // Default to student; they can be updated later by admin
                        is_approved: false, // Students need explicit assignment/approval
                        is_admin_approved: false,
                        is_teacher_approved: false,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error("PROFILE_AUTO_HEAL_FAILED:", createError);
                    return NextResponse.json({ error: "Profile not found and could not be created" }, { status: 404 });
                }

                console.log("PROFILE_AUTO_HEALED:", userId);
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

        const { full_name, phone_number, bio, department, grade, address, avatar_url } = result.data;

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name,
                phone_number,
                bio,
                department,
                grade,
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

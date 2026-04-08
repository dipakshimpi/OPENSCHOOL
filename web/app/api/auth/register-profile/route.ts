import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SERVICE_SUPABASESERVICE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, full_name, role, phone_number, school_id } = body;

        if (!email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        // Insert into the profiles table
        const { data: newProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                email: email.toLowerCase(),
                role: role || 'student',
                full_name: full_name || `${firstName} ${lastName}`.trim(),
                phone_number,
                school_id: school_id || null,
                is_approved: true,
                is_admin_approved: true,
                is_teacher_approved: false,
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (profileError) {
            console.error("REGISTER_PROFILE_ERROR:", profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: newProfile?.id });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        console.error("REGISTER_API_ERROR:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

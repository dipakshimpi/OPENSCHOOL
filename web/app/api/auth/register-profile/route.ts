import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, email, full_name, role, phone_number, school_id } = body;

        if (!id || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert into the profiles table manually
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id, // Use the Firebase UID as the primary key
                role: role || 'student',
                full_name,
                phone_number,
                school_id: school_id || null,
                is_approved: role === 'teacher' ? false : true, // Auto-approve others like before
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("SYNC_PROFILE_ERROR:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("REGISTER_PROFILE_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

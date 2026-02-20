import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createKeycloakUser } from "@/lib/keycloak-admin";

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
        const { email, password, firstName, lastName, full_name, role, phone_number, school_id } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`[Register] Creating Keycloak user: ${email}`);

        // 1. Create User in Keycloak (Headless)
        const keycloakId = await createKeycloakUser({
            email,
            password,
            firstName: firstName || full_name?.split(' ')[0] || '',
            lastName: lastName || full_name?.split(' ').slice(1).join(' ') || ''
        });

        if (!keycloakId) {
            throw new Error("Failed to get Keycloak ID after user creation");
        }

        console.log(`[Register] Keycloak user created with ID: ${keycloakId}. Syncing to Supabase...`);

        // 2. Insert into the profiles table in Supabase
        const supabaseAdmin = getSupabaseAdmin();
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: keycloakId, // Use the Keycloak sub UUID as primary key
                role: role || 'student',
                full_name: full_name || `${firstName} ${lastName}`.trim(),
                phone_number,
                school_id: school_id || null,
                is_approved: role === 'teacher' ? false : true,
                is_admin_approved: role === 'student' ? false : true,
                is_teacher_approved: false,
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error("SYNC_PROFILE_ERROR:", profileError);
            // Note: We don't delete the Keycloak user here for now, but in a production app 
            // you might want to handle rollbacks.
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: keycloakId });
    } catch (error: any) {
        console.error("REGISTER_API_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

export async function isEmailAllowed(email: string, intendedRole?: string) {
    if (!email) return { allowed: false, role: null };

    console.log("[DEBUG] isEmailAllowed checking:", email, "Intended:", intendedRole);
    const adminEmail = process.env.ADMIN_EMAIL || "";

    // 1. Admin shortcut (case-insensitive)
    if (email.toLowerCase() === adminEmail.toLowerCase()) {
        console.log("[DEBUG] isEmailAllowed - ADMIN MATCH FOUND!");
        return { allowed: true, role: 'admin' as const };
    }

    // 2. Check Supabase allowlist for specific roles (e.g. pre-approved Teachers)
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('allowed_emails')
        .select('role')
        .eq('email', email)
        .single();

    if (data && !error) {
        console.log("[DEBUG] isEmailAllowed - Found in allowlist with role:", data.role);
        return { allowed: true, role: data.role as 'admin' | 'teacher' | 'student' };
    }

    // 3. Default for Production: Allow the user in with their requested role (pending approval).
    const finalRole = (intendedRole === 'teacher' || intendedRole === 'student') ? intendedRole : 'student';
    console.log(`[DEBUG] isEmailAllowed - New user, granting pending '${finalRole}' role.`);
    return { allowed: true, role: finalRole as 'teacher' | 'student' };
}

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SERVICE_SUPABASESERVICE_KEY!;
    return createClient(url, key);
}

export async function isEmailAllowed(email: string, intendedRole?: string) {
    if (!email) return { allowed: false, role: null };

    const adminEmail = process.env.ADMIN_EMAIL || "";

    // 1. Admin shortcut (case-insensitive)
    if (email.toLowerCase() === adminEmail.toLowerCase()) {
        console.log("[DEBUG] isEmailAllowed - ADMIN MATCH FOUND!");
        // Allow the master admin to choose a specific role for testing
        if (intendedRole === 'teacher' || intendedRole === 'student') {
            console.log(`[DEBUG] isEmailAllowed - Admin ${email} requested testing role: ${intendedRole}`);
            return { allowed: true, role: intendedRole as 'admin' | 'teacher' | 'student' };
        }
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

    // 3. Prevent unauthorized 'admin' role requests
    if (intendedRole === 'admin') {
        console.warn(`[DEBUG] isEmailAllowed - Unauthorized admin request from ${email}`);
        return { allowed: true, role: 'student' as const };
    }

    // 4. Default for New Users: Grant requested role (pending approval logic elsewhere)
    const finalRole = (intendedRole === 'teacher' || intendedRole === 'student') ? intendedRole : 'student';
    console.log(`[DEBUG] isEmailAllowed - New user ${email}, granting pending '${finalRole}' role.`);
    return { allowed: true, role: finalRole as 'teacher' | 'student' };
}

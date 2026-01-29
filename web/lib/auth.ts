import { createClient } from './supabase/server';
import { UserRole, parseRole } from './rbac';

/**
 * Gets the current authenticated user and their profile data.
 * Must be used in Server Components or API Routes (server-side).
 */
export async function getServerAuth() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { user: null, profile: null, error: authError };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return {
        user,
        profile: profile ? {
            ...profile,
            role: parseRole(profile.role)
        } : null,
        error: profileError
    };
}

/**
 * Helper to check if the current user has a specific role
 */
export async function checkRole(requiredRole: UserRole | UserRole[]) {
    const { profile } = await getServerAuth();

    if (!profile) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(profile.role);
}

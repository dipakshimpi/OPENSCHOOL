import { createClient } from '@supabase/supabase-js'

// Admin client using service role key - bypasses RLS
// Use ONLY for server-side operations that need to bypass RLS
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SERVICE_SUPABASESERVICE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase admin credentials');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAdmin() {
    const email = process.env.ADMIN_EMAIL || "shimpidipak81@gmail.com";
    console.log(`Checking role for: ${email}`);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email); // Wait, profiles might not have email column, usually they use id

    // Let's try fetching by email in Keycloak or just search profiles
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*');

    console.log("Profiles in DB:", profiles?.map(p => ({ id: p.id, role: p.role, name: p.full_name })));
}

checkAdmin();

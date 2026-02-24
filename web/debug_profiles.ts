import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_SUPABASESERVICE_KEY!
);

async function checkAdmin() {
    const email = process.env.ADMIN_EMAIL || "shimpidipak81@gmail.com";
    console.log(`Checking role for: ${email}`);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error("Error fetching profile by email:", error);
    } else {
        console.log("Profile by email result:", data);
    }

    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*');

    if (pError) {
        console.error("Error fetching all profiles:", pError);
    }

    console.log("Profiles in DB:", profiles?.map(p => ({ id: p.id, role: p.role, name: p.full_name, email: p.email })));
}

checkAdmin();

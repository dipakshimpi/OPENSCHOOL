const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkVideo() {
    console.log("Checking video 'a2LnJAUDn6XwoFcWyaGrFr'...");

    // We cannot easily check RLS protected data as Anon, 
    // but if we are Admin (service role) we could. 
    // Since we don't have service role key in .env.local usually,
    // we will try to just list ANY video to see if table exists and has data.

    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', 'a2LnJAUDn6XwoFcWyaGrFr');

    if (error) {
        console.error("Error fetching video:", error);
    } else {
        console.log("Video found:", data);
    }
}

checkVideo();

/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkVideos() {
    const { count, error } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching videos:', error);
        process.exit(1);
    }

    console.log(`TOTAL_VIDEOS_IN_DB: ${count}`);
}

checkVideos();

/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCourses() {
    const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching courses:', error);
        process.exit(1);
    }

    console.log(`TOTAL_COURSES_IN_DB: ${count}`);
}

checkCourses();

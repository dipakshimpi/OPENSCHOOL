/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTeachers() {
    console.log('Fetching all teachers...\n');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');

    if (error) {
        console.error('Error fetching teachers:', error.message);
        process.exit(1);
    }

    console.log(`TOTAL TEACHERS: ${data.length}\n`);

    const approved = data.filter(t => t.is_approved);
    const pending = data.filter(t => !t.is_approved);

    console.log(`✅ APPROVED: ${approved.length}`);
    console.log(`⏳ PENDING: ${pending.length}\n`);

    if (approved.length > 0) {
        console.log('Approved Teachers:');
        approved.forEach(t => {
            const name = t.full_name || t.name || 'Unknown';
            console.log(`  - ${name} (${t.email || 'No email'})`);
        });
    }

    if (pending.length > 0) {
        console.log('\nPending Approval:');
        pending.forEach(t => {
            const name = t.full_name || t.name || 'Unknown';
            console.log(`  - ${name} (${t.email || 'No email'})`);
        });
    }

    // Debug: Show first teacher's structure
    if (data.length > 0) {
        console.log('\nSample teacher data structure:');
        console.log(JSON.stringify(data[0], null, 2));
    }
}

checkTeachers();

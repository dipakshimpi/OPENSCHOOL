/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSystemHealth() {
    console.log('🏥 OpenSchool System Health Check\n');

    // 1. Check Courses
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    console.log(`📚 Courses: ${courseCount}`);

    // 2. Check Teachers
    const { data: teachers } = await supabase.from('profiles').select('is_approved').eq('role', 'teacher');
    const approvedTeachers = teachers?.filter(t => t.is_approved).length || 0;
    const pendingTeachers = teachers?.filter(t => !t.is_approved).length || 0;
    console.log(`👨‍🏫 Teachers: ${teachers?.length || 0} Total (${approvedTeachers} Approved / ${pendingTeachers} Pending)`);

    // 3. Check Videos (and Schema)
    const { count: videoCount, error: videoError } = await supabase.from('videos').select('*', { count: 'exact', head: true });
    if (videoError) {
        console.log(`❌ Videos: Schema Error! (${videoError.message})`);
        console.log('   👉 ACTION: Run "fix_videos_schema.sql" in Supabase to fix this.');
    } else {
        console.log(`🎥 Videos: ${videoCount}`);
    }

    // 4. Check Attendance Table
    const { error: attendanceError } = await supabase.from('student_attendance').select('*', { head: true });
    if (attendanceError && attendanceError.code === '42P01') {
        console.log(`❌ Attendance Table: Missing!`);
        console.log('   👉 ACTION: Run "migration_student_attendance.sql" in Supabase to fix this.');
    } else if (attendanceError) {
        console.log(`⚠️ Attendance Table: Error (${attendanceError.message})`);
    } else {
        console.log(`✅ Attendance Table: Ready`);
    }

    console.log('\nDone.');
}

checkSystemHealth();

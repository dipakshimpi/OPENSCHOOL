import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get user profile for name/role
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'teacher') {
            // Teacher stats
            const { count: courseCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('instructor_id', user.id);

            // Get all students enrolled in teacher's courses
            const { data: courses } = await supabase
                .from('courses')
                .select('id')
                .eq('instructor_id', user.id);

            const courseIds = courses?.map(c => c.id) || [];
            const { count: studentCount } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .in('course_id', courseIds);

            // Calculate real attendance rate
            const { data: attendanceLogs } = await supabase
                .from('attendance')
                .select('status')
                .eq('teacher_id', user.id);

            const totalAttendanceRecords = attendanceLogs?.length || 0;
            const presentRecords = attendanceLogs?.filter(a => a.status === 'present').length || 0;
            const attendanceRate = totalAttendanceRecords > 0
                ? (presentRecords / totalAttendanceRecords) * 100
                : 100;

            return NextResponse.json({
                role: 'teacher',
                fullName: profile.full_name,
                stats: {
                    activeCourses: courseCount || 0,
                    totalStudents: studentCount || 0,
                    attendanceRate: Math.round(attendanceRate * 10) / 10
                }
            });
        } else if (profile?.role === 'admin') {
            // Admin stats
            const { count: studentCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            const { count: teacherCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'teacher');

            const { count: courseCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            const { data: attendanceLogs } = await supabase
                .from('attendance')
                .select('status');

            const totalAttendanceRecords = attendanceLogs?.length || 0;
            const presentRecords = attendanceLogs?.filter(a => a.status === 'present').length || 0;
            const attendanceRate = totalAttendanceRecords > 0
                ? (presentRecords / totalAttendanceRecords) * 100
                : 95; // Default if no data yet

            // Fetch recent activities (enrollments + new courses)
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('enrolled_at, profiles(full_name), courses(title)')
                .order('enrolled_at', { ascending: false })
                .limit(5);

            return NextResponse.json({
                role: 'admin',
                fullName: profile.full_name,
                stats: {
                    studentCount: studentCount || 0,
                    teacherCount: teacherCount || 0,
                    courseCount: courseCount || 0,
                    attendanceRate: Math.round(attendanceRate)
                },
                recentActivity: enrollments?.map(e => ({
                    user: (e.profiles as any)?.full_name || 'Anonymous',
                    action: 'enrolled in',
                    target: (e.courses as any)?.title || 'Course',
                    time: new Date(e.enrolled_at).toLocaleTimeString()
                })) || []
            });
        } else {
            // Student stats
            const { data: enrollments, count: enrollmentCount } = await supabase
                .from('enrollments')
                .select('*, courses(*, profiles(full_name))')
                .eq('student_id', user.id);

            const avgProgress = enrollments && enrollments.length > 0
                ? enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / enrollments.length
                : 0;

            return NextResponse.json({
                role: 'student',
                fullName: profile?.full_name || 'Student',
                enrolledCourses: enrollments || [],
                stats: {
                    enrolledCount: enrollmentCount || 0,
                    avgProgress: Math.round(avgProgress)
                }
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

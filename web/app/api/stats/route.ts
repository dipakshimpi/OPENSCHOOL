import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

// Use Service Role for backend-to-backend communication
export const dynamic = "force-dynamic";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

interface Profile {
    id: string;
    role: 'admin' | 'teacher' | 'student';
    full_name: string;
    grade_level?: string;
}


export async function GET() {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();
        const userId = session.uid;

        // Get user profile for name/role
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const userProfile = profile as Profile;

        if (userProfile?.role === 'teacher') {
            // Teacher stats
            const { count: courseCount } = await supabaseAdmin
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('instructor_id', userId);

            // Get all students enrolled in teacher's courses
            const { data: courses } = await supabaseAdmin
                .from('courses')
                .select('id')
                .eq('instructor_id', userId);

            const courseIds = courses?.map((c) => c.id) || [];
            const { count: studentCount } = await supabaseAdmin
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .in('course_id', courseIds);

            // Calculate real attendance rate
            const { data: attendanceLogs } = await supabaseAdmin
                .from('attendance')
                .select('status')
                .eq('teacher_id', userId);

            const totalAttendanceRecords = attendanceLogs?.length || 0;
            const presentRecords = attendanceLogs?.filter((a) => a.status === 'present').length || 0;
            const attendanceRate = totalAttendanceRecords > 0
                ? (presentRecords / totalAttendanceRecords) * 100
                : 100;

            return NextResponse.json({
                role: 'teacher',
                fullName: userProfile.full_name,
                stats: {
                    activeCourses: courseCount || 0,
                    totalStudents: studentCount || 0,
                    attendanceRate: Math.round(attendanceRate * 10) / 10
                }
            });
        } else if (userProfile?.role === 'admin') {
            // Admin stats - GET HIGH FIDELITY INSIGHTS
            const { count: studentCount } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            const { count: pendingStudents } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student')
                .or('is_admin_approved.eq.false,is_teacher_approved.eq.false');

            const { count: teacherCount } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'teacher');

            const { count: pendingTeachers } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'teacher')
                .eq('is_approved', false);

            const { count: courseCount } = await supabaseAdmin
                .from('courses')
                .select('*', { count: 'exact', head: true });

            const { data: attendanceLogs } = await supabaseAdmin
                .from('attendance')
                .select('status');

            const totalAttendanceRecords = attendanceLogs?.length || 0;
            const presentRecords = attendanceLogs?.filter((a) => a.status === 'present').length || 0;
            const attendanceRate = totalAttendanceRecords > 0
                ? (presentRecords / totalAttendanceRecords) * 100
                : 95;

            // Fetch recent activities (enrollments + new profiles)
            const { data: recentProfiles } = await supabaseAdmin
                .from('profiles')
                .select('full_name, role, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            return NextResponse.json({
                role: 'admin',
                fullName: userProfile.full_name,
                stats: {
                    studentCount: studentCount || 0,
                    teacherCount: teacherCount || 0,
                    courseCount: courseCount || 0,
                    attendanceRate: Math.round(attendanceRate),
                    pendingStudents: pendingStudents || 0,
                    pendingTeachers: pendingTeachers || 0
                },
                recentActivity: (recentProfiles || []).map((p) => ({
                    user: p.full_name || 'Anonymous',
                    action: 'registered as',
                    target: p.role?.toUpperCase() || 'USER',
                    time: new Date(p.created_at).toLocaleTimeString()
                }))
            });
        } else {
            // Student stats: RAIN-PROOF Robust Queries
            // 1. Fetch enrollments
            const { data: enrollmentsData, error: enrollError } = await supabaseAdmin
                .from('enrollments')
                .select('*')
                .eq('student_id', userId);

            if (enrollError) throw enrollError;

            const enrollments = enrollmentsData || [];

            // 2. Resolve Course Details Manually (to bypass relationship issues)
            const courseIds = [...new Set(enrollments.map(e => e.course_id).filter(Boolean))];
            let coursesWithDetails: {
                progress: number;
                course_id: string;
                student_id: string;
                courses: Record<string, unknown> | null
            }[] = [];

            if (courseIds.length > 0) {
                const { data: coursesData } = await supabaseAdmin
                    .from('courses')
                    .select('*')
                    .in('id', courseIds);

                if (coursesData) {
                    // 3. Resolve Instructor Names
                    const instructorIds = [...new Set(coursesData.map(c => c.instructor_id).filter(Boolean))];
                    const { data: instructors } = await supabaseAdmin
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', instructorIds);

                    const instMap: Record<string, string> = {};
                    instructors?.forEach(i => instMap[i.id] = i.full_name);

                    // 4. Enrich Enrollments
                    coursesWithDetails = enrollments.map(e => {
                        const course = coursesData.find(c => c.id === e.course_id);
                        return {
                            ...e,
                            courses: course ? {
                                ...course,
                                profiles: { full_name: instMap[course.instructor_id] || "Unknown Teacher" }
                            } : null
                        };
                    });
                }
            }

            const avgProgress = enrollments.length > 0
                ? enrollments.reduce((acc: number, curr) => acc + (curr.progress || 0), 0) / enrollments.length
                : 0;

            // Fetch real attendance rate for this student
            const { data: attendanceRecords } = await supabaseAdmin
                .from('student_attendance')
                .select('status')
                .eq('student_id', userId);

            const totalAttendance = attendanceRecords?.length || 0;
            const presentCount = attendanceRecords?.filter((a) => a.status === 'present').length || 0;
            const attendanceRate = totalAttendance > 0
                ? (presentCount / totalAttendance) * 100
                : 100; // Default to 100% if no records yet

            return NextResponse.json({
                role: 'student',
                fullName: userProfile?.full_name || 'Student',
                gradeLevel: userProfile?.grade_level || null,
                enrolledCourses: coursesWithDetails,
                stats: {
                    enrolledCount: enrollments.length,
                    avgProgress: Math.round(avgProgress),
                    attendanceRate: Math.round(attendanceRate)
                }
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        const adminClient = createAdminClient();

        // 1. Check auth session
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get user profile to determine role
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', session.uid)
            .single();

        const userRole = profile?.role || 'student';

        // 3. Build video query based on role
        let query = adminClient.from('videos').select('*');
        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        // 🔒 For students: only show videos from enrolled courses
        if (userRole === 'student') {
            // First get enrolled course IDs
            const { data: enrollments } = await adminClient
                .from('enrollments')
                .select('course_id')
                .eq('student_id', session.uid);

            const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];

            if (enrolledCourseIds.length === 0) {
                return NextResponse.json([]); // No enrollments = no videos
            }

            // Filter videos to only enrolled courses
            if (courseId) {
                // Already filtering by courseId, verify enrollment
                if (!enrolledCourseIds.includes(courseId)) {
                    return NextResponse.json([]); // Not enrolled in this course
                }
            } else {
                query = query.in('course_id', enrolledCourseIds);
            }
        }

        // 🔒 For teachers: only show their own videos
        if (userRole === 'teacher') {
            query = query.eq('teacher_id', session.uid);
        }
        // Admins: see all videos (no filter)

        const { data: videos, error: videosError } = await query.order('created_at', { ascending: false });

        if (videosError) {
            console.error("GET_VIDEOS_DB_ERROR:", videosError);
            throw videosError;
        }

        if (!videos || videos.length === 0) {
            return NextResponse.json([]);
        }

        // 4. Fetch courses separately to merge metadata (Robust Join)
        const uniqueCourseIds = [...new Set(videos.map(v => v.course_id).filter(Boolean))];
        const { data: coursesData, error: coursesError } = await adminClient
            .from('courses')
            .select('id, title')
            .in('id', uniqueCourseIds);

        const courseMap: Record<string, string> = {};
        if (!coursesError && coursesData) {
            coursesData.forEach(c => {
                courseMap[c.id] = c.title;
            });
        }

        // 5. Merge data — IMPORTANT: strip video_url from response (security)
        const transformedVideos = videos.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            thumbnail_url: v.thumbnail_url,
            duration: v.duration,
            course_id: v.course_id,
            teacher_id: v.teacher_id,
            created_at: v.created_at,
            courses: { title: courseMap[v.course_id] || "Unknown Course" }
            // ⛔ video_url is intentionally NOT included here
        }));

        return NextResponse.json(transformedVideos);
    } catch (error) {
        console.error("GET_VIDEOS_API_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, video_url, course_id, thumbnail_url, duration } = body;

        if (!title || !video_url || !course_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Support Ant Media Server IDs
        let videoId: string;
        if (video_url.startsWith('ams:')) {
            videoId = video_url.replace('ams:', '');
        } else {
            // Assume it's already a clean stream ID from AMS
            videoId = video_url;
        }

        const adminClient = createAdminClient();

        const videoData = {
            id: videoId,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            course_id,
            teacher_id: session.user.id
        };

        const { data, error } = await adminClient
            .from('videos')
            .insert(videoData)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("VIDEO_METADATA_SAVE_ERROR:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}

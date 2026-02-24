import { NextResponse } from "next/server";
import { courseSchema } from "@/lib/validations";
import { createClient } from "@supabase/supabase-js";
import { verifySession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

// Use Service Role for backend-to-backend communication
// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SERVICE_SUPABASESERVICE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(url, key);
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 1. Fetch courses without potentially problematic joins
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('*');

    if (coursesError) {
      console.error("GET_COURSES_ERROR:", coursesError);
      throw coursesError;
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Manually fetch distinct profiles
    const instructorIds = [...new Set(courses.map(c => c.instructor_id).filter(Boolean))];

    const profileMap: Record<string, { full_name: string }> = {};

    if (instructorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', instructorIds);

      if (profilesError) {
        console.error("GET_PROFILES_ERROR:", profilesError);
      } else {
        profiles?.forEach(p => {
          profileMap[p.id] = { full_name: p.full_name };
        });
      }
    }

    // 3. Merge data
    const transformedData = courses.map(course => ({
      ...course,
      profiles: profileMap[course.instructor_id] || { full_name: 'Unknown Instructor' },
      enrollmentCount: 0 // Placeholder until join stability is confirmed
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET_COURSES_API_ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// verifySession is now imported at the top

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabaseAdmin = getSupabaseAdmin();
    const userId = session.uid;

    // Get auth user profile to check if valid instructor/admin?
    // Wait, usually POST /api/courses is for creating a course?
    // Admin creates it via /api/admin/courses.
    // Does a Teacher create a course? The UI suggests 'Create Course' in Teacher Dashboard.

    // Check if user is a teacher or admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return NextResponse.json({ error: "Teacher/Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: "Invalid input",
        details: result.error.format()
      }, { status: 400 });
    }

    const { title, description, thumbnail_url } = result.data;

    // Insert course
    // If teacher, instructor_id = userId
    // If admin, they might be assigning it? Admin uses /api/admin/courses mostly.
    // If this endpoint is used by teachers, it sets instructor_id to themselves.
    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert({
        title,
        description,
        thumbnail_url,
        instructor_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("COURSE INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST_COURSE_API_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

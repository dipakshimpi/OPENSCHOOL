import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, profiles(full_name), enrollments(count)');

    if (error) throw error;

    // Transform the data to have a cleaner count field
    const transformedData = courses.map(course => ({
      ...course,
      enrollmentCount: course.enrollments?.[0]?.count || 0
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get auth user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, thumbnail_url } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Profile not found. Please re-login." },
        { status: 400 }
      );
    }

    // Insert course
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        thumbnail_url,
        instructor_id: profile.id,
      })
      .select()
      .single();

    if (error) {
      console.error("COURSE INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

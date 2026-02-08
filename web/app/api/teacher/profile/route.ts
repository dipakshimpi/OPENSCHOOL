import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Get course count
        const { count: courseCount } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('instructor_id', user.id);

        return NextResponse.json({
            fullName: profile.full_name || "Teacher",
            role: profile.role,
            status: profile.is_approved ? "Verified" : "Pending Approval",
            email: user.email,
            assignedCourses: courseCount || 0,
            memberSince: new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            teacherId: profile.id.slice(0, 8).toUpperCase()
        });
    } catch (error) {
        console.error("GET_TEACHER_PROFILE_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

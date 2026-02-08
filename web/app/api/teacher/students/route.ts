import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherApproved = searchParams.get('teacher_approved');

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Teacher
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'teacher') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch students who are Admin Approved
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .eq('is_admin_approved', true);

        if (teacherApproved === 'true') {
            query = query.eq('is_teacher_approved', true);
        } else if (teacherApproved === 'false') {
            query = query.eq('is_teacher_approved', false);
        }

        const { data: students, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(students);
    } catch (error) {
        console.error("FETCH_STUDENTS_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Teacher
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'teacher') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id, is_teacher_approved } = body;

        if (!id) return NextResponse.json({ error: "Missing student ID" }, { status: 400 });

        if (typeof is_teacher_approved === 'undefined') {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // USE ADMIN CLIENT TO BYPASS RLS
        // (Regular client can't update other people's profiles due to RLS)
        const adminClient = createAdminClient();

        // Only allow updating is_teacher_approved
        const { data, error } = await adminClient
            .from('profiles')
            .update({ is_teacher_approved })
            .eq('id', id)
            .eq('is_admin_approved', true) // Security: Can only approve if admin already approved
            .select();

        if (error) {
            console.error("TEACHER_STUDENT_UPDATE_ERROR:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn("STUDENT_APPROVAL_FAILED:", id, "Either student doesn't exist or isn't Admin Approved yet.");
            return NextResponse.json({ error: "User not found or not admin approved yet" }, { status: 404 });
        }

        console.log("STUDENT_TEACHER_APPROVED_SUCCESSFULLY:", id);
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("UPDATE_STUDENT_ERROR:", error);
        return NextResponse.json({
            error: "Failed to update student",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

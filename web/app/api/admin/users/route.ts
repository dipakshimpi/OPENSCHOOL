import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function GET(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();

        // Check if the verified user is an admin
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', session.uid)
            .single();

        if (adminProfile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const adminApproved = searchParams.get('admin_approved');
        const teacherApproved = searchParams.get('teacher_approved');
        const approved = searchParams.get('approved');

        let query = supabaseAdmin.from('profiles').select('*');

        if (role) {
            query = query.eq('role', role);
        }

        if (adminApproved === 'true') {
            query = query.eq('is_admin_approved', true);
        } else if (adminApproved === 'false') {
            query = query.eq('is_admin_approved', false);
        }

        if (teacherApproved === 'true') {
            query = query.eq('is_teacher_approved', true);
        } else if (teacherApproved === 'false') {
            query = query.eq('is_teacher_approved', false);
        }

        if (approved === 'true') {
            query = query.eq('is_approved', true);
        } else if (approved === 'false') {
            query = query.eq('is_approved', false);
        }

        const { data: users, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(users);
    } catch (error) {
        console.error("FETCH_USERS_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();

        // Check if the verified user is an admin
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', session.uid)
            .single();

        if (adminProfile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id, is_admin_approved, is_teacher_approved, is_approved, school_id, grade_level, section } = body;

        if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

        const updates: Record<string, unknown> = {};
        if (typeof is_approved !== 'undefined') {
            updates.is_approved = is_approved;
            updates.is_admin_approved = is_approved;
            updates.is_teacher_approved = is_approved;
        } else {
            if (typeof is_admin_approved !== 'undefined') updates.is_admin_approved = is_admin_approved;
            if (typeof is_teacher_approved !== 'undefined') updates.is_teacher_approved = is_teacher_approved;
        }

        if (typeof school_id !== 'undefined') updates.school_id = school_id;
        if (typeof grade_level !== 'undefined') updates.grade_level = grade_level;
        if (typeof section !== 'undefined') updates.section = section;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("UPDATE_USER_ERROR:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();

        // Check if the verified user is an admin
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', session.uid)
            .single();

        if (adminProfile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE_USER_ERROR:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}

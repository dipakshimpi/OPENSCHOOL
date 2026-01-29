import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let query = supabase.from('profiles').select('*');
        if (role) {
            query = query.eq('role', role);
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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { id, is_approved } = body;

        if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

        const { data, error } = await supabase
            .from('profiles')
            .update({ is_approved })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("UPDATE_USER_ERROR:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

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
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();

        // 1. Fetch announcements without join
        const { data: announcements, error: fetchError } = await supabaseAdmin
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error("Failed to fetch announcements:", fetchError);
            throw fetchError;
        }

        if (!announcements || announcements.length === 0) {
            return NextResponse.json([]);
        }

        // 2. Manually fetch distinct profiles
        const adminIds = [...new Set(announcements.map(a => a.admin_id).filter(Boolean))];
        const profileMap: Record<string, { full_name: string }> = {};

        if (adminIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name')
                .in('id', adminIds);

            if (!profilesError) {
                profiles?.forEach(p => {
                    profileMap[p.id] = { full_name: p.full_name };
                });
            }
        }

        // 3. Merge data
        const transformedData = announcements.map(a => ({
            ...a,
            profiles: profileMap[a.admin_id] || { full_name: 'Unknown Admin' }
        }));

        return NextResponse.json(transformedData);
    } catch (err) {
        console.error("GET_ANNOUNCEMENTS_ERROR:", err);
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabaseAdmin = getSupabaseAdmin();

        const userId = session.uid;

        // Check if actually admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, priority, target_role } = body;

        const { data, error } = await supabaseAdmin
            .from('announcements')
            .insert({
                title,
                content,
                priority: priority || 'normal',
                target_role: target_role || 'all',
                admin_id: userId
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        console.error("POST_ANNOUNCEMENT_ERROR:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

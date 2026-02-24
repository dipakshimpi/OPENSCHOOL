import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SERVICE_SUPABASESERVICE_KEY;

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

        // 1. Verify Admin Status
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('role, school_id')
            .eq('id', session.uid)
            .single();

        if (adminProfile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const teacherId = searchParams.get('teacherId');

        // 2. Build Query
        let query = supabaseAdmin
            .from('attendance')
            .select(`
                *,
                profiles:teacher_id (
                    full_name,
                    email
                )
            `)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }

        const { data: logs, error } = await query;

        if (error) throw error;

        // 3. Aggregate Stats for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: todayLogs } = await supabaseAdmin
            .from('attendance')
            .select('status, admin_override')
            .gte('timestamp', today.toISOString());

        const totalToday = todayLogs?.length || 0;
        const overrides = todayLogs?.filter(l => l.admin_override).length || 0;

        return NextResponse.json({
            logs,
            stats: {
                totalToday,
                overridesToday: overrides,
                verifiedToday: totalToday - overrides
            }
        });

    } catch (error) {
        console.error("ADMIN_ATTENDANCE_FETCH_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Use Service Role for backend-to-backend communication
// Helper to get supabase admin client lazily
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase admin environment variables");
    }

    return createClient(url, key);
}

export async function GET() {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.uid;

        const supabaseAdmin = getSupabaseAdmin();

        // Get user's school_id
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('school_id')
            .eq('id', userId)
            .single();

        if (!profile?.school_id) {
            return NextResponse.json([]); // No school assigned
        }

        const { data: fences, error } = await supabaseAdmin
            .from('geo_fences')
            .select('*')
            .eq('school_id', profile.school_id);

        if (error) throw error;
        return NextResponse.json(fences);
    } catch (error) {
        console.error("GET_GEOFENCES_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch geo-fences" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.uid;

        const supabaseAdmin = getSupabaseAdmin();

        // Verify admin role and get school_id
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role, school_id')
            .eq('id', userId)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Only admins can manage school boundaries" }, { status: 403 });
        }

        let schoolId = profile?.school_id;

        // Self-healing: If admin is missing a school_id, generate one for them
        if (!schoolId) {
            const newSchoolId = crypto.randomUUID();
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ school_id: newSchoolId })
                .eq('id', userId);

            if (updateError) {
                console.error("Failed to auto-assign school_id:", updateError);
                return NextResponse.json({ error: "Failed to initialize school profile" }, { status: 500 });
            }
            schoolId = newSchoolId;
        }

        const body = await request.json();
        const { center_lat, center_lng, radius_meters, name } = body;

        if (!center_lat || !center_lng) {
            return NextResponse.json({ error: "Coordinates required" }, { status: 400 });
        }

        // We'll manage one main fence per school for this demo/setup
        // Check if one exists
        const { data: existing } = await supabaseAdmin
            .from('geo_fences')
            .select('id')
            .eq('school_id', schoolId)
            .limit(1)
            .single();

        let result;
        if (existing) {
            const { data, error } = await supabaseAdmin
                .from('geo_fences')
                .update({
                    center_lat,
                    center_lng,
                    radius_meters: radius_meters || 100,
                    name: name || "Main Campus"
                })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabaseAdmin
                .from('geo_fences')
                .insert({
                    school_id: schoolId,
                    center_lat,
                    center_lng,
                    radius_meters: radius_meters || 100,
                    name: name || "Main Campus"
                })
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("GEO_FENCE_POST_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

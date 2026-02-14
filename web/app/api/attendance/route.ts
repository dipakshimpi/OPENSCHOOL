import { NextResponse } from "next/server";
import { attendanceSchema } from "@/lib/validations";
import { verifySession } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";
import { isWithinGeofence } from "@/lib/geo";

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
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const supabaseAdmin = getSupabaseAdmin();
        const userId = session.uid;

        // Check if there's an attendance record for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('teacher_id', userId)
            .gte('timestamp', today.toISOString())
            .order('timestamp', { ascending: false })
            .limit(1);

        if (error) {
            console.error("Fetch Attendance Error:", error);
            return NextResponse.json({ error: "Failed to fetch attendance status" }, { status: 500 });
        }

        return NextResponse.json({
            hasAttended: data && data.length > 0,
            lastAttendance: data && data.length > 0 ? data[0] : null
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const supabaseAdmin = getSupabaseAdmin();
        const userId = session.uid;

        // 2. Get user's school_id
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('school_id')
            .eq('id', userId)
            .single();

        if (!profile?.school_id) {
            return NextResponse.json({ error: "No school assigned to your profile" }, { status: 403 });
        }

        // 3. Parse request body
        const body = await request.json();
        const result = attendanceSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: result.error.format()
            }, { status: 400 });
        }

        const { latitude, longitude, accuracy, deviceInfo, adminOverride, overrideReason } = result.data;

        // 4. Fetch geo-fences for THIS specific school
        const { data: fences, error: fenceError } = await supabaseAdmin
            .from('geo_fences')
            .select('*')
            .eq('school_id', profile.school_id);

        if (fenceError) {
            return NextResponse.json({ error: "Failed to fetch school boundary data" }, { status: 500 });
        }

        // 5. Verify if within school boundary
        let isInside = false;

        if (!fences || fences.length === 0) {
            return NextResponse.json({
                error: "School boundary not configured",
                message: "Location tracking is enabled but no school boundary has been set by your Admin."
            }, { status: 403 });
        } else {
            for (const fence of fences) {
                if (isWithinGeofence(latitude, longitude, fence.center_lat, fence.center_lng, fence.radius_meters)) {
                    isInside = true;
                    break;
                }
            }
        }

        if (!isInside && !body.adminOverride) {
            return NextResponse.json({
                error: "Outside school premises",
                isInside: false,
                message: "You must be within the school boundary set by your Admin to mark attendance."
            }, { status: 403 });
        }

        // 6. Insert attendance record
        const { data, error: insertError } = await supabaseAdmin
            .from('attendance')
            .insert({
                teacher_id: userId,
                latitude,
                longitude,
                accuracy,
                status: 'present',
                device_info: deviceInfo || {},
                admin_override: adminOverride || false,
                override_reason: overrideReason || null,
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error("Attendance Insert Error:", insertError);
            return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
            message: "Attendance marked successfully!"
        });

    } catch (error) {
        console.error("API Error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

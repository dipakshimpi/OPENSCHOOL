import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isWithinGeofence } from "@/lib/geo";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse request body
        const body = await request.json();
        const { latitude, longitude, accuracy, deviceInfo } = body;

        if (!latitude || !longitude) {
            return NextResponse.json({ error: "Location data required" }, { status: 400 });
        }

        // 3. Fetch geo-fences for verification
        const { data: fences, error: fenceError } = await supabase
            .from('geo_fences')
            .select('*');

        if (fenceError) {
            return NextResponse.json({ error: "Failed to fetch campus data" }, { status: 500 });
        }

        // 4. Verify if within ANY geo-fence
        let isInside = false;

        for (const fence of fences) {
            if (isWithinGeofence(latitude, longitude, fence.center_lat, fence.center_lng, fence.radius_meters)) {
                isInside = true;
                break;
            }
        }

        // For demo purposes, we can allow even if outside if we want to show "Admin Override"
        // But for the "Star Feature", let's be strict unless it's an override.
        if (!isInside && !body.adminOverride) {
            return NextResponse.json({
                error: "Outside school premises",
                isInside: false,
                message: "You must be within the school boundary to mark attendance."
            }, { status: 403 });
        }

        // 5. Insert attendance record
        const { data, error: insertError } = await supabase
            .from('attendance')
            .insert({
                teacher_id: user.id,
                latitude,
                longitude,
                accuracy,
                status: 'present',
                device_info: deviceInfo || {},
                admin_override: body.adminOverride || false,
                override_reason: body.overrideReason || null,
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

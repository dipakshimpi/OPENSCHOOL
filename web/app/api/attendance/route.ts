import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isWithinGeofence } from "@/lib/geo";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if there's an attendance record for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('teacher_id', user.id)
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
        const supabase = await createClient();

        // 1. Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get user's school_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('school_id')
            .eq('id', user.id)
            .single();

        if (!profile?.school_id) {
            return NextResponse.json({ error: "No school assigned to your profile" }, { status: 403 });
        }

        // 3. Parse request body
        const body = await request.json();
        const { latitude, longitude, accuracy, deviceInfo } = body;

        if (!latitude || !longitude) {
            return NextResponse.json({ error: "Location data required" }, { status: 400 });
        }

        // 4. Fetch geo-fences for THIS specific school
        const { data: fences, error: fenceError } = await supabase
            .from('geo_fences')
            .select('*')
            .eq('school_id', profile.school_id);

        if (fenceError) {
            return NextResponse.json({ error: "Failed to fetch school boundary data" }, { status: 500 });
        }

        // 5. Verify if within school boundary
        let isInside = false;

        // If no fences are set yet, we allow for demo/first-time setup 
        // Or we could be strict. Let's be semi-strict.
        if (fences.length === 0) {
            console.log("No school fence set for school", profile.school_id);
            isInside = true; // Temporary allow for demo
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

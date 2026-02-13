import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validations";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        // Also get email from auth.user
        return NextResponse.json({
            ...profile,
            email: user.email
        });
    } catch (error) {
        console.error("GET_PROFILE_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();

        // 2. Validate input with Zod
        const result = profileSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                error: "Invalid input",
                details: result.error.format()
            }, { status: 400 });
        }

        const { full_name, phone_number, bio, department, grade, address, avatar_url } = result.data;

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name,
                phone_number,
                bio,
                department,
                grade,
                address,
                avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("PATCH_PROFILE_ERROR:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

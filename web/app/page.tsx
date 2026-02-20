import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth-utils";
import { isEmailAllowed } from "@/lib/user-roles";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export default async function Home({ searchParams }: { searchParams: { intendedRole?: string } }) {
  const session = await verifySession();
  const cookieStore = await cookies();

  console.log("[DEBUG] Home Page - Session found:", !!session);
  console.log("[DEBUG] Home Page - Search Params:", searchParams);

  if (!session) {
    console.log("[DEBUG] Home Page - No session, redirecting to login");
    redirect("/auth/login");
  }

  // 1. Check if user already has a profile (to get their actual role)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.uid)
    .single();

  if (profile?.role) {
    console.log(`[Home] Existing profile found. Redirecting to: /${profile.role}`);
    return redirect(`/${profile.role}`);
  }

  // 2. New User: Determine role and auto-create profile
  // Priority: Query Param > Cookie > Default(student)
  const intendedRole = searchParams.intendedRole || cookieStore.get('intended_role')?.value;

  console.log("[Home] New user detected. Checking access for:", session.email);

  const { allowed, role } = await isEmailAllowed(session.email || "", intendedRole);

  if (!allowed) {
    console.error("[Home] Access Denied for:", session.email);
    redirect("/auth/login?error=AccessDenied");
  }

  // Auto-create the profile in Supabase
  console.log(`[Home] Auto-creating profile for ${session.email} with role ${role}...`);
  const { error: createError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: session.uid,
      email: session.email,
      full_name: session.name || session.email?.split('@')[0] || 'User',
      role: role,
      is_approved: role === 'teacher' ? false : true, // Teachers need admin approval
      is_admin_approved: role === 'student' ? false : true, // Students need admin approval
      is_teacher_approved: false, // Students need teacher approval
      updated_at: new Date().toISOString()
    });

  if (createError) {
    console.error("[Home] Failed to auto-create profile:", createError);
    // Continue anyway, dashboards will handle missing profile
  }

  // 3. Redirect to specific dashboard
  console.log(`[Home] New user profile synced. Redirecting to: /${role}`);
  redirect(`/${role}`);
}

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth-utils";
import { isEmailAllowed } from "@/lib/user-roles";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export default async function Home({ searchParams: searchParamsPromise }: { searchParams: Promise<{ intendedRole?: string }> }) {
  const searchParams = await searchParamsPromise;
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
    process.env.SERVICE_SUPABASESERVICE_KEY!
  );

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.uid)
    .single();

  const isMasterAdmin = session.email?.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();

  // For master admin, priority is: URL Param > 'admin' (ignoring sticky cookies)
  // For others: URL Param > Cookie > Default
  const requestedRole = searchParams.intendedRole || (isMasterAdmin ? 'admin' : cookieStore.get('intended_role')?.value);

  // If profile exists, check if we need to sync/override role
  if (profile?.role) {
    const validRoles = ['teacher', 'student', 'admin'];
    const requestedRoleValid = requestedRole && validRoles.includes(requestedRole);
    const isRoleChange = requestedRoleValid && requestedRole !== profile.role;

    if (isRoleChange) {
      // 🛡️ SECURITY: Block non-admins from escalating to 'admin'
      if (requestedRole === 'admin' && !isMasterAdmin) {
        console.warn(`[Home] Unauthorized admin escalation attempt blocked for: ${session.email}`);
        return redirect(`/${profile.role}`);
      }

      console.log(`[Home] Role update requested for ${session.email}: ${profile.role} -> ${requestedRole}`);

      // Update the profile with the new role
      await supabaseAdmin
        .from('profiles')
        .update({
          role: requestedRole,
          // If switching TO teacher, require manual approval
          ...(requestedRole === 'teacher' ? { is_approved: false } : { is_approved: true })
        })
        .eq('id', session.uid);

      return redirect(`/${requestedRole}`);
    }

    console.log(`[Home] Existing profile found. Redirecting to: /${profile.role}`);
    return redirect(`/${profile.role}`);
  }

  // 2. New User: Determine role and auto-create profile
  const intendedRole = requestedRole; // Use the same logic we calculated above

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

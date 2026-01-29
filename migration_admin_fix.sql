-- CRITICAL SECURITY FIX: Allow Admins to Update Profiles
-- Without this, the 'Approve Account' button will return 0 rows (404) 
-- because the Admin user doesn't have RLS permission to UPDATE other profiles.

-- 1. Create a secure Policy for Admins to UPDATE any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    -- Allow if the *requesting user* is an admin
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- 2. Ensure they can also READ all profiles (already covered by "Public profiles...", but good to be explicit)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

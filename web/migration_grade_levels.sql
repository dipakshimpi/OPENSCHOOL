-- Add grade_level column to profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'grade_level') THEN
        ALTER TABLE public.profiles ADD COLUMN grade_level TEXT;
    END IF;
END $$;

-- Add grade_level column to courses table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'grade_level') THEN
        ALTER TABLE public.courses ADD COLUMN grade_level TEXT;
    END IF;
END $$;

-- Make sure students are NOT approved by default (updated logic)
-- Previously only teachers needed approval. now students need it too for grade assignment.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- 1. Safely handle the role cast
  BEGIN
    v_role := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student'::user_role;
  END;

  -- 2. Insert into profiles with proper approval logic
  INSERT INTO public.profiles (id, role, full_name, avatar_url, phone_number, is_approved)
  VALUES (
    new.id,
    v_role,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number',
    -- 3. Auto-approve ONLY admins. Teachers AND Students need approval/grade assignment.
    CASE 
      WHEN v_role = 'admin' THEN true -- Admins auto-approved (usually created via seed or first user)
      ELSE false -- Teachers need verification, Students need Class assignment
    END
  );
  RETURN new;
END;
$$;

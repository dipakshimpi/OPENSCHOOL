-- DAY 4 SECURITY MIGRATION: Teacher Approval & Video Protection

-- 1. Add 'is_approved' column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_approved') THEN 
        ALTER TABLE public.profiles ADD COLUMN is_approved BOOLEAN DEFAULT false; 
    END IF; 
END $$;

-- 2. Update the 'handle_new_user' trigger
-- This ensures Teachers are NOT approved by default.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role := 'student'; -- Default role
BEGIN
  -- 1. Determine role from metadata
  IF (new.raw_user_meta_data->>'role') IS NOT NULL THEN
    v_role := (new.raw_user_meta_data->>'role')::user_role;
  END IF;

  -- 2. Insert into profiles
  INSERT INTO public.profiles (
    id, 
    role, 
    full_name, 
    avatar_url, 
    phone_number, 
    school_id, 
    is_approved
  )
  VALUES (
    new.id,
    v_role,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN (new.raw_user_meta_data->>'school_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
      THEN (new.raw_user_meta_data->>'school_id')::UUID 
      ELSE NULL 
    END,
    -- 3. Auto-approve Students/Admins, DESTROY Teachers (require manual approval)
    CASE 
      WHEN v_role = 'teacher' THEN false 
      ELSE true 
    END
  );
  RETURN new;
END;
$$;

-- 3. Create Videos Table (if not exists) for PeerTube Integration
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  peertube_url TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Enable RLS on Videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 5. Create Video Security Policies
DROP POLICY IF EXISTS "Videos are viewable by enrolled students" ON public.videos;
CREATE POLICY "Videos are viewable by enrolled students" ON public.videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.course_id = videos.course_id 
      AND enrollments.student_id = auth.uid()
    ) 
    OR teacher_id = auth.uid()
  );

DROP POLICY IF EXISTS "Teachers can manage their own videos" ON public.videos;
CREATE POLICY "Teachers can manage their own videos" ON public.videos
  FOR ALL USING (auth.uid() = teacher_id);

-- 6. Manually Approve your existing Admin account (just in case)
-- Replace 'admin@openschool.com' with your actual admin email if needed.
-- UPDATE public.profiles SET is_approved = true WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@openschool.com');

-- 1. Create role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  school_id UUID, -- India: multi-school support
  phone_number TEXT, -- India: phone > email
  is_approved BOOLEAN DEFAULT false NOT NULL, -- New: Admin approval flag
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(student_id, course_id)
);

-- 5. Attendance table (THE STAR FEATURE)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC, -- Browser accuracy in meters
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'present',
  device_info JSONB,
  admin_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Geo-fences table
CREATE TABLE IF NOT EXISTS public.geo_fences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  center_lat NUMERIC NOT NULL,
  center_lng NUMERIC NOT NULL,
  radius_meters INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_fences ENABLE ROW LEVEL SECURITY;

-- 8. SIMPLE RLS POLICIES (Demo-ready)

-- Profiles: Anyone can read profiles (basic info), users can update their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Courses: Everyone can read courses. Instructors/Admins can manage.
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone" ON public.courses
  FOR SELECT USING (true);

-- Attendance: Teachers view own, Admins view all
DROP POLICY IF EXISTS "Teachers can view own attendance" ON public.attendance;
CREATE POLICY "Teachers can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert own attendance" ON public.attendance;
CREATE POLICY "Teachers can insert own attendance" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- 9. AUTH TRIGGER (ROBUST VERSION)
-- This automatically creates a profile and handles potential metadata errors
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

  -- 2. Insert into profiles with safety checks
  INSERT INTO public.profiles (id, role, full_name, avatar_url, phone_number, school_id, is_approved)
  VALUES (
    new.id,
    v_role,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN (new.raw_user_meta_data->>'school_id') IS NULL OR (new.raw_user_meta_data->>'school_id') = '' THEN NULL 
      -- Only cast path if it looks like a UUID
      WHEN (new.raw_user_meta_data->>'school_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
      THEN (new.raw_user_meta_data->>'school_id')::UUID 
      ELSE NULL 
    END,
    -- 3. Auto-approve students and admins, wait for teachers
    CASE 
      WHEN v_role = 'teacher' THEN false 
      ELSE true 
    END
  );
  RETURN new;
END;
$$;

-- DROP AND RECREATE TRIGGER TO AVOID DUPLICATES
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

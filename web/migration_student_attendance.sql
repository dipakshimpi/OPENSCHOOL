-- ============================================
-- ADD STUDENT ATTENDANCE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- Optional: for course-based attendance
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent')) DEFAULT 'present',
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  grade_level TEXT,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(student_id, date, course_id)
);

-- Enable RLS
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Teachers can manage student attendance" ON public.student_attendance;
CREATE POLICY "Teachers can manage student attendance" ON public.student_attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin'))
  );

DROP POLICY IF EXISTS "Students can view their own attendance" ON public.student_attendance;
CREATE POLICY "Students can view their own attendance" ON public.student_attendance
  FOR SELECT USING (student_id = auth.uid());

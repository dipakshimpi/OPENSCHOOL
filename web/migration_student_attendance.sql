-- Create a specific table for individual student attendance
CREATE TABLE IF NOT EXISTS public.student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(student_id, course_id, date)
);

-- Enable RLS
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance
DROP POLICY IF EXISTS "Students can view own attendance" ON public.student_attendance;
CREATE POLICY "Students can view own attendance" ON public.student_attendance
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can view and insert attendance for their courses
DROP POLICY IF EXISTS "Teachers can manage student attendance" ON public.student_attendance;
CREATE POLICY "Teachers can manage student attendance" ON public.student_attendance
  FOR ALL USING (
    auth.uid() = teacher_id OR 
    EXISTS (
      SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()
    )
  );

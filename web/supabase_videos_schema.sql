-- 10. Videos table for PeerTube integration
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  peertube_url TEXT NOT NULL, -- The shared/embed URL from PeerTube
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
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

-- Recreating videos table to support PeerTube shortUUIDs as primary key
DROP TABLE IF EXISTS public.videos CASCADE;

CREATE TABLE public.videos (
  id TEXT PRIMARY KEY, -- Changed from UUID to TEXT for PeerTube compliance
  title TEXT NOT NULL,
  description TEXT,
  peertube_url TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Videos are viewable by enrolled students" ON public.videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.course_id = videos.course_id 
      AND enrollments.student_id = auth.uid()
    ) 
    OR teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can manage their own videos" ON public.videos
  FOR ALL USING (auth.uid() = teacher_id);

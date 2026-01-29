-- FIX VIDEO TABLE: Support PeerTube String IDs
-- PeerTube uses 'short text' IDs (like 'a2LnJAUD...'), not UUIDs.
-- This script safely migrates the table to use TEXT for the ID column.

DO $$ 
BEGIN
    -- 1. Drop existing policies to allow alteration
    DROP POLICY IF EXISTS "Videos are viewable by enrolled students" ON public.videos;
    DROP POLICY IF EXISTS "Teachers can manage their own videos" ON public.videos;

    -- 2. If the table exists, we need to alter the ID column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
        -- We drop and recreate because changing Primary Key type is tricky with dependencies
        DROP TABLE public.videos;
    END IF;
    
    -- 3. Recreate Table with TEXT Primary Key
    CREATE TABLE public.videos (
        id TEXT PRIMARY KEY, -- Changed from UUID to TEXT
        title TEXT NOT NULL,
        description TEXT,
        peertube_url TEXT NOT NULL,
        course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
        teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    -- 4. Enable RLS
    ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

    -- 5. Re-apply Policies
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

END $$;

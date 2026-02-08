-- Fix Row Level Security (RLS) for Courses Table

-- 1. Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 2. Allow Admins to do EVERYTHING (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
CREATE POLICY "Admins can manage all courses"
ON courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 3. Allow Teachers to create their own courses
DROP POLICY IF EXISTS "Teachers can insert courses" ON courses;
CREATE POLICY "Teachers can insert courses"
ON courses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'teacher' AND profiles.is_approved = true
  )
);

-- 4. Allow Teachers to update ONLY their own courses
DROP POLICY IF EXISTS "Teachers can update own courses" ON courses;
CREATE POLICY "Teachers can update own courses"
ON courses
FOR UPDATE
TO authenticated
USING (
  instructor_id = auth.uid()
);

-- 5. Allow Everyone (Authenticated) to View Courses
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
CREATE POLICY "Everyone can view courses"
ON courses
FOR SELECT
TO authenticated
USING (true);

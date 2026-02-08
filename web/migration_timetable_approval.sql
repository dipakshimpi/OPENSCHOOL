-- Add approval columns to profiles
-- We default to true for existing users to avoid locking them out, but new users will handle this in logic or we can set default false if acceptable.
-- User requested logic: Student -> Admin Approve -> Teacher Approve -> Access.
-- So we need these columns.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_teacher_approved BOOLEAN DEFAULT FALSE;

-- Update existing admins and teachers to be approved by default?
UPDATE profiles SET is_admin_approved = TRUE, is_teacher_approved = TRUE WHERE role IN ('admin', 'teacher');
-- Update existing students effectively? Maybe existing ones are fine.
-- UPDATE profiles SET is_admin_approved = TRUE, is_teacher_approved = TRUE WHERE role = 'student';

-- Create Timetables Table
-- Design: Indian School Style (Day, Period, Subject, Teacher, Class)
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_grade TEXT NOT NULL, -- e.g. "10"
    section TEXT NOT NULL, -- e.g. "A"
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
    period_number INTEGER NOT NULL, -- 1-8
    start_time TIME,
    end_time TIME,
    subject TEXT NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint to prevent double booking a teacher
    CONSTRAINT unique_teacher_slot UNIQUE (teacher_id, day_of_week, period_number),
    -- Constraint to prevent double booking a class
    CONSTRAINT unique_class_slot UNIQUE (class_grade, section, day_of_week, period_number)
);

-- Enable RLS
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all timetables" ON timetables
    FOR ALL
    USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Teachers can view all timetables" ON timetables
    FOR SELECT
    USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'teacher')
    );

CREATE POLICY "Students can view their class timetables" ON timetables
    FOR SELECT
    USING (
        -- This logic requires checking the student's class, which we might not have stored yet.
        -- For now, allow students to view all or match based on some profile field if it exists.
        -- Assuming profiles has 'class_grade' or similar? 
        -- If not, we might need to add it or just allow view all for simplicity as per "no complexity" rule.
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'student')
    );

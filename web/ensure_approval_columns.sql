-- Ensure all approval columns exist in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_teacher_approved BOOLEAN DEFAULT FALSE;

-- Sync them for existing teachers/admins if needed
UPDATE profiles 
SET is_approved = TRUE, is_admin_approved = TRUE, is_teacher_approved = TRUE 
WHERE role IN ('admin', 'teacher') AND (is_approved = FALSE OR is_admin_approved = FALSE OR is_teacher_approved = FALSE);

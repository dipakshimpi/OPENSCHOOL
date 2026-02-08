-- =====================================================
-- CLEANUP SCRIPT: Remove all test users from database
-- Run this in Supabase SQL Editor
-- =====================================================

-- ⚠️ WARNING: This will DELETE all users except the auth.users system
-- Make sure you want to do this!

-- Step 1: Delete all enrollments first (foreign key dependencies)
DELETE FROM public.enrollments;

-- Step 2: Delete all videos (teachers reference)
DELETE FROM public.videos;

-- Step 3: Delete all courses (teacher reference)
DELETE FROM public.courses;

-- Step 4: Delete all student attendance records
DELETE FROM public.student_attendance;

-- Step 5: Delete all timetable entries
DELETE FROM public.timetable;

-- Step 6: Delete all announcements
DELETE FROM public.announcements;

-- Step 7: Delete all profiles (this is the main user data table)
DELETE FROM public.profiles;

-- Step 8: Delete all auth users (this removes login credentials)
-- Note: You'll need to do this via Supabase Dashboard > Authentication > Users
-- Or use the Supabase Admin API

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check remaining profiles
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Check remaining courses
SELECT COUNT(*) as course_count FROM public.courses;

-- Check remaining videos  
SELECT COUNT(*) as video_count FROM public.videos;

-- Check remaining enrollments
SELECT COUNT(*) as enrollment_count FROM public.enrollments;

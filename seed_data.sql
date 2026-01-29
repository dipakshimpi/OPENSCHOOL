-- 1. Create a dummy school geo-fence
-- You can change these coordinates to your actual location for testing!
INSERT INTO public.geo_fences (name, center_lat, center_lng, radius_meters)
VALUES ('Demo School Campus', 28.6139, 77.2090, 100); 

-- 2. Create sample courses
INSERT INTO public.courses (title, description, thumbnail_url)
VALUES 
('Advanced Mathematics', 'A deep dive into Calculus and Linear Algebra.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop'),
('Introduction to Physics', 'Understanding the laws of motion and thermodynamics.', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop'),
('Computer Science 101', 'Learning the fundamentals of programming and logic.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop');

-- NOTE: We don't insert users here because they must go through Supabase Auth.
-- To test:
-- 1. Sign up as a Teacher in the app.
-- 2. Sign up as a Student in the app.
-- 3. Sign up as an Admin in the app.
-- The trigger we created in the schema will automatically handle the profiles.

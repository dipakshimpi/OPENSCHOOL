-- Add extra profile fields for LMS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update RLS policies to ensure users can read their own detailed info 
-- (They already can via the 'viewable by everyone' policy, but let's be explicit if needed)
-- "Public profiles are viewable by everyone" covers SELECT.

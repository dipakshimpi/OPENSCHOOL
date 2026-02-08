-- Add school_id to geo_fences to link boundaries to specific schools
ALTER TABLE IF EXISTS public.geo_fences 
ADD COLUMN IF NOT EXISTS school_id UUID;

-- Update RLS for geo_fences
ALTER TABLE public.geo_fences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view their school's geofences" ON public.geo_fences;
CREATE POLICY "Anyone can view their school's geofences" ON public.geo_fences
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage their school's geofences" ON public.geo_fences;
CREATE POLICY "Admins can manage their school's geofences" ON public.geo_fences
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin' AND school_id = geo_fences.school_id
    )
  );

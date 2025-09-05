-- Update RLS policies for extracted_data table to require authentication
-- This prevents competitors from harvesting agent contact information

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view extracted data" ON public.extracted_data;
DROP POLICY IF EXISTS "Anyone can insert extracted data" ON public.extracted_data;

-- Create new restrictive policies that require authentication
CREATE POLICY "Authenticated users can view extracted data" 
ON public.extracted_data 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert extracted data" 
ON public.extracted_data 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also update tasks table policies to be consistent
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;

CREATE POLICY "Authenticated users can view tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (true);
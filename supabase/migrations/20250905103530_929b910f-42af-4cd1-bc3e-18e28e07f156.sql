-- Revert RLS policies to allow anonymous access (no authentication required)

-- Drop the current authenticated-only policies for extracted_data table
DROP POLICY IF EXISTS "Authenticated users can view extracted data" ON public.extracted_data;
DROP POLICY IF EXISTS "Authenticated users can insert extracted data" ON public.extracted_data;

-- Create new policies that allow anonymous access for extracted_data
CREATE POLICY "Anyone can view extracted data" 
ON public.extracted_data 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert extracted data" 
ON public.extracted_data 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Drop the current authenticated-only policies for tasks table
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;

-- Create new policies that allow anonymous access for tasks
CREATE POLICY "Anyone can view tasks" 
ON public.tasks 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert tasks" 
ON public.tasks 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update tasks" 
ON public.tasks 
FOR UPDATE 
TO anon, authenticated
USING (true);
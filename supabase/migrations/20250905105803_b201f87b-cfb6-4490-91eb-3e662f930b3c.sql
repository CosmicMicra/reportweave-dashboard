-- Add support for multi-property tasks and PDF operations

-- Add new task types and properties field to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS properties_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS source_urls TEXT[] DEFAULT NULL;

-- Add PDF operations table for tracking merge/split operations
CREATE TABLE IF NOT EXISTS public.pdf_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('merge', 'split')),
  input_files TEXT[] NOT NULL,
  output_files TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pdf_operations table
ALTER TABLE public.pdf_operations ENABLE ROW LEVEL SECURITY;

-- Create policies for pdf_operations
CREATE POLICY "Anyone can view pdf operations" 
ON public.pdf_operations 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert pdf operations" 
ON public.pdf_operations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update pdf operations" 
ON public.pdf_operations 
FOR UPDATE 
TO anon, authenticated
USING (true);

-- Add trigger for updated_at on pdf_operations
CREATE TRIGGER update_pdf_operations_updated_at
BEFORE UPDATE ON public.pdf_operations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
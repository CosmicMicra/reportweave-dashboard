-- Add comprehensive property data fields to extracted_data table
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS agent_name TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS agent_phone TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS agent_email TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS agent_license TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS agent_brokerage TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS property_description TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS school_district TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS elementary_school TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS middle_school TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS high_school TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS walk_score INTEGER;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS transit_score INTEGER;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS bike_score INTEGER;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS property_tax TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS hoa_fees TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS insurance_cost TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS days_on_market INTEGER;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS price_per_sqft TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS last_sold_date TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS last_sold_price TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS lot_size TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS parking_info TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS map_location_url TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS mls_number TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS listing_date TEXT;
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS features TEXT[]; -- Array of property features
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS nearby_amenities TEXT[]; -- Array of nearby amenities
ALTER TABLE public.extracted_data ADD COLUMN IF NOT EXISTS property_images TEXT[]; -- Array of property image URLs
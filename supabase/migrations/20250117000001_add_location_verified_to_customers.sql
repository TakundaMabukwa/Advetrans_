-- Add location_verified flag to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN customers.location_verified IS 'True if customer location has been successfully geocoded and verified';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_location_verified ON customers(location_verified);

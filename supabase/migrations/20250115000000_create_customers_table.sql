-- Create customers table with zone, address, and restrictions
CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  zone TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  restrictions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON public.customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_zone ON public.customers(zone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(customer_name);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage customers
CREATE POLICY "Allow authenticated users to manage customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add customer_id reference to pending_orders if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_orders' 
    AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.pending_orders 
    ADD COLUMN customer_id TEXT;
  END IF;
END $$;

-- Create index on pending_orders.customer_id
CREATE INDEX IF NOT EXISTS idx_pending_orders_customer_id ON public.pending_orders(customer_id);

-- Create pending_orders table for vehicle assignment workflow
CREATE TABLE IF NOT EXISTS public.pending_orders (
  id BIGSERIAL PRIMARY KEY,
  trip_id TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  shipping_point TEXT,
  total_weight NUMERIC NOT NULL DEFAULT 0,
  net_weight NUMERIC,
  drums NUMERIC DEFAULT 0,
  location TEXT,
  delivery_date TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  location_group TEXT,
  route_group TEXT, -- For grouping orders by route/destination
  recommended_for_route TEXT, -- Route this order is recommended for
  status TEXT NOT NULL DEFAULT 'unassigned', -- 'unassigned' or 'assigned'
  assigned_vehicle_id BIGINT REFERENCES vehiclesc(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON public.pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_vehicle ON public.pending_orders(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_location_group ON public.pending_orders(location_group);
CREATE INDEX IF NOT EXISTS idx_pending_orders_route_group ON public.pending_orders(route_group);
CREATE INDEX IF NOT EXISTS idx_pending_orders_recommended_route ON public.pending_orders(recommended_for_route);

-- Add RLS policies (adjust based on your auth setup)
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write
CREATE POLICY "Allow authenticated users to manage pending orders"
  ON public.pending_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trip_routes table
CREATE TABLE IF NOT EXISTS public.trip_routes (
  trip_id text NOT NULL,
  route_points jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT trip_routes_pkey PRIMARY KEY (trip_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trip_routes_trip_id ON public.trip_routes USING btree (trip_id);

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_trip_routes_route_points ON public.trip_routes USING gin (route_points);

-- Add RLS (Row Level Security) if needed
ALTER TABLE public.trip_routes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON public.trip_routes
  FOR ALL USING (auth.role() = 'authenticated');
-- Add pickup_time and dropoff_time columns to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS pickup_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS dropoff_time timestamp with time zone;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_pickup_time ON public.trips (pickup_time);
CREATE INDEX IF NOT EXISTS idx_trips_dropoff_time ON public.trips (dropoff_time);
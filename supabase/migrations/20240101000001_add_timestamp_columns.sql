-- Add timestamp columns to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS time_accepted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_on_trip TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_completed TIMESTAMP WITH TIME ZONE;

-- Add timestamp columns to audit table
ALTER TABLE audit 
ADD COLUMN IF NOT EXISTS time_accepted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_on_trip TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS time_completed TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_time_accepted ON trips(time_accepted);
CREATE INDEX IF NOT EXISTS idx_trips_time_on_trip ON trips(time_on_trip);
CREATE INDEX IF NOT EXISTS idx_trips_time_completed ON trips(time_completed);

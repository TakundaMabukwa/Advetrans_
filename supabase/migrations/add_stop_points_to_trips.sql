-- Add stop_point_ids column to trips table to store references to stop_points
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS stop_point_ids INTEGER[];

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_stop_point_ids 
ON trips USING GIN (stop_point_ids);

-- Add comment
COMMENT ON COLUMN trips.stop_point_ids IS 'Array of stop_point IDs that were used in this trip route';

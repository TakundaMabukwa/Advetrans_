-- Add actual timing columns to trips table for real-time tracking

-- Add actual start/end time columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS actual_start_time timestamp with time zone;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS actual_end_time timestamp with time zone;

-- Add trigger to automatically set actual_start_time when status changes to 'in-transit'
CREATE OR REPLACE FUNCTION set_actual_start_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Set actual start time when status changes to 'accepted' or 'Accepted'
    IF OLD.status NOT IN ('accepted', 'Accepted') AND NEW.status IN ('accepted', 'Accepted') AND NEW.actual_start_time IS NULL THEN
        NEW.actual_start_time = NOW();
        RAISE NOTICE 'Set actual_start_time for trip_id: % (status: accepted)', NEW.trip_id;
    END IF;
    
    -- Set actual end time when status changes to 'completed' or 'delivered'
    IF OLD.status NOT IN ('completed', 'delivered') AND NEW.status IN ('completed', 'delivered') AND NEW.actual_end_time IS NULL THEN
        NEW.actual_end_time = NOW();
        RAISE NOTICE 'Set actual_end_time for trip_id: %', NEW.trip_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timing
DROP TRIGGER IF EXISTS set_trip_actual_times ON trips;
CREATE TRIGGER set_trip_actual_times
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION set_actual_start_time();

-- Test the enhanced system
-- UPDATE trips SET status = 'in-transit' WHERE trip_id = 'TEST-AUDIT-001';
-- UPDATE trips SET status = 'completed', total_distance = 150.5 WHERE trip_id = 'TEST-AUDIT-001';
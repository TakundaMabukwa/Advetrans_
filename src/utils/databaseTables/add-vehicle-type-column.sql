-- Add selected_vehicle_type column to trips table to store rate card vehicle type

ALTER TABLE trips ADD COLUMN IF NOT EXISTS selected_vehicle_type text;

-- Add comment for documentation
COMMENT ON COLUMN trips.selected_vehicle_type IS 'Vehicle type selected from rate card system for cost calculations';

-- Update existing trips with default vehicle type if needed
-- UPDATE trips SET selected_vehicle_type = 'TAUTLINER' WHERE selected_vehicle_type IS NULL;
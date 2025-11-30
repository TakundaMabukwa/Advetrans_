-- Function to log timestamps for key trip milestones
CREATE OR REPLACE FUNCTION copy_trip_to_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Time Arrival On-Site (loading status)
  IF (NEW.status = 'loading' AND (OLD.status IS NULL OR OLD.status != 'loading')) THEN
    NEW.time_accepted := NOW();
  END IF;
  
  -- Departure Time (on-trip status)
  IF (NEW.status = 'on-trip' AND (OLD.status IS NULL OR OLD.status != 'on-trip')) THEN
    NEW.time_on_trip := NOW();
  END IF;
  
  -- Completion Time (delivered or completed status)
  IF (NEW.status IN ('delivered', 'completed') AND 
      (OLD.status IS NULL OR OLD.status NOT IN ('delivered', 'completed'))) THEN
    NEW.time_completed := NOW();
    
    -- Copy completed trip to audit table
    INSERT INTO audit (
      id,
      trip_id,
      origin,
      destination,
      cargo,
      cargo_weight,
      rate,
      status,
      clientdetails,
      selectedclient,
      updated_at,
      created_at,
      ordernumber,
      status_notes,
      vehicleassignments,
      stop_points,
      pickup_locations,
      dropoff_locations,
      time_accepted,
      time_on_trip,
      time_completed
    )
    VALUES (
      NEW.id,
      NEW.trip_id,
      NEW.origin,
      NEW.destination,
      NEW.cargo,
      NEW.cargo_weight,
      NEW.rate,
      NEW.status,
      NEW.clientdetails,
      NEW.selectedclient,
      NEW.updated_at,
      NEW.created_at,
      NEW.ordernumber,
      NEW.status_notes,
      NEW.vehicleassignments,
      NEW.stop_points,
      NEW.pickup_locations,
      NEW.dropoff_locations,
      NEW.time_accepted,
      NEW.time_on_trip,
      NEW.time_completed
    )
    ON CONFLICT (trip_id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at,
      time_completed = EXCLUDED.time_completed;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_copy_to_audit ON trips;
CREATE TRIGGER trigger_copy_to_audit
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION copy_trip_to_audit();

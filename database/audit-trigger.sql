-- Function to copy completed trips to audit table
CREATE OR REPLACE FUNCTION copy_completed_trip_to_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if status changed to 'delivered'
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        INSERT INTO audit (
            trip_id, ordernumber, rate, status, startdate, end_date, cost_centre,
            origin, destination, cargo, cargo_weight, notes, drivers, vehicles,
            vehicle_assignments, pickup_locations, dropoff_locations, waypoints,
            selected_stop_points, stop_points, selected_client, client_details,
            status_notes, route, driver, vehicle, distance, costcentre, enddate,
            cargoweight, vehicleassignments, pickuplocations, dropofflocations,
            selectedstoppoints, stoppoints, selectedclient, clientdetails,
            statusnotes, created_at, updated_at, status_history, load_inspection_id,
            actual_start, actual_end_time, time_diff
        ) VALUES (
            NEW.trip_id, NEW.ordernumber, NEW.rate, NEW.status, NEW.startdate,
            NEW.end_date, NEW.cost_centre, NEW.origin, NEW.destination, NEW.cargo,
            NEW.cargo_weight, NEW.notes, NEW.drivers, NEW.vehicles,
            NEW.vehicle_assignments, NEW.pickup_locations, NEW.dropoff_locations,
            NEW.waypoints, NEW.selected_stop_points, NEW.stop_points,
            NEW.selected_client, NEW.client_details, NEW.status_notes, NEW.route,
            NEW.driver, NEW.vehicle, NEW.distance, NEW.costcentre, NEW.enddate,
            NEW.cargoweight, NEW.vehicleassignments, NEW.pickuplocations,
            NEW.dropofflocations, NEW.selectedstoppoints, NEW.stoppoints,
            NEW.selectedclient, NEW.clientdetails, NEW.statusnotes, NEW.created_at,
            NEW.updated_at, NEW.status_history, NEW.load_inspection_id,
            NEW.created_at, -- actual_start (using created_at as start time)
            NOW(), -- actual_end_time (current timestamp when completed)
            EXTRACT(EPOCH FROM (NOW() - NEW.created_at))/3600 -- time_diff in hours
        )
        ON CONFLICT (trip_id) DO UPDATE SET
            status = NEW.status,
            actual_end_time = NOW(),
            time_diff = EXTRACT(EPOCH FROM (NOW() - NEW.created_at))/3600,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS audit_completed_trips ON trips;
CREATE TRIGGER audit_completed_trips
    AFTER UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION copy_completed_trip_to_audit();
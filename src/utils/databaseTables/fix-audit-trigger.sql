-- Drop existing trigger and function
DROP TRIGGER IF EXISTS audit_completed_trips ON trips;
DROP FUNCTION IF EXISTS copy_completed_trip_to_audit();

-- Create the corrected trigger function
CREATE OR REPLACE FUNCTION copy_completed_trip_to_audit()
RETURNS TRIGGER AS $$
BEGIN
    -- Log trigger execution
    RAISE NOTICE 'Audit trigger fired for trip_id: %, total_distance: %', NEW.trip_id, NEW.total_distance;
    
    -- Check if total_distance is set and has changed
    IF NEW.total_distance IS NOT NULL AND 
       (OLD IS NULL OR OLD.total_distance IS NULL OR OLD.total_distance != NEW.total_distance) THEN
        
        RAISE NOTICE 'Inserting/updating audit for trip_id: %', NEW.trip_id;
        
        -- Insert or update audit record
        INSERT INTO audit (
            trip_id, 
            ordernumber,
            rate,
            status,
            startdate,
            end_date,
            cost_centre,
            origin,
            destination,
            cargo,
            cargo_weight,
            notes,
            drivers,
            vehicles,
            vehicle_assignments,
            pickup_locations,
            dropoff_locations,
            waypoints,
            selected_stop_points,
            stop_points,
            selected_client,
            client_details,
            status_notes,
            route,
            driver,
            vehicle,
            distance,
            costcentre,
            enddate,
            cargoweight,
            vehicleassignments,
            pickuplocations,
            dropofflocations,
            selectedstoppoints,
            stoppoints,
            selectedclient,
            clientdetails,
            statusnotes,
            created_at,
            updated_at,
            status_history,
            load_inspection_id,
            actual_distance,
            actual_total_cost,
            fuel_price_used,
            vehicle_type
        )
        VALUES (
            NEW.trip_id,
            NEW.ordernumber,
            NEW.rate,
            NEW.status,
            NEW.startdate,
            NEW.end_date,
            NEW.cost_centre,
            NEW.origin,
            NEW.destination,
            NEW.cargo,
            NEW.cargo_weight,
            NEW.notes,
            NEW.drivers,
            NEW.vehicles,
            NEW.vehicle_assignments,
            NEW.pickup_locations,
            NEW.dropoff_locations,
            NEW.waypoints,
            NEW.selected_stop_points,
            NEW.stop_points,
            NEW.selected_client,
            NEW.client_details,
            NEW.status_notes,
            NEW.route,
            NEW.driver,
            NEW.vehicle,
            NEW.distance,
            NEW.costcentre,
            NEW.enddate,
            NEW.cargoweight,
            NEW.vehicleassignments,
            NEW.pickuplocations,
            NEW.dropofflocations,
            NEW.selectedstoppoints,
            NEW.stoppoints,
            NEW.selectedclient,
            NEW.clientdetails,
            NEW.statusnotes,
            NEW.created_at,
            NOW(),
            NEW.status_history,
            NEW.load_inspection_id,
            NEW.total_distance,
            -- Calculate actual total cost using rate card
            4070 + 7280 + (NEW.total_distance * 3.00),
            COALESCE(NEW.fuel_price_per_liter, 21.55),
            'TAUTLINER'
        )
        ON CONFLICT (trip_id) DO UPDATE SET
            actual_distance = NEW.total_distance,
            actual_total_cost = 4070 + 7280 + (NEW.total_distance * 3.00),
            fuel_price_used = COALESCE(NEW.fuel_price_per_liter, 21.55),
            updated_at = NOW(),
            status = NEW.status,
            vehicleassignments = NEW.vehicleassignments,
            pickuplocations = NEW.pickuplocations,
            dropofflocations = NEW.dropofflocations;
            
        RAISE NOTICE 'Audit record processed for trip_id: %', NEW.trip_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER audit_completed_trips
    AFTER INSERT OR UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION copy_completed_trip_to_audit();

-- Test the trigger

-- 1. First, let's create a test trip
INSERT INTO trips (
    trip_id, 
    ordernumber, 
    rate, 
    status, 
    origin, 
    destination, 
    cargo,
    fuel_price_per_liter,
    estimated_distance
) VALUES (
    'TEST-AUDIT-001',
    'ORD-TEST-001', 
    '15000', 
    'pending', 
    'Johannesburg', 
    'Cape Town', 
    'General Cargo',
    21.55,
    1400
);

-- 2. Check if trip was created
SELECT trip_id, ordernumber, status, total_distance FROM trips WHERE trip_id = 'TEST-AUDIT-001';

-- 3. Check audit table before update (should be empty for this trip)
SELECT trip_id, actual_distance, actual_total_cost FROM audit WHERE trip_id = 'TEST-AUDIT-001';

-- 4. Update the trip with total_distance to trigger the audit
UPDATE trips SET total_distance = 1450.75 WHERE trip_id = 'TEST-AUDIT-001';

-- 5. Check if audit record was created
SELECT 
    trip_id, 
    actual_distance, 
    actual_total_cost, 
    fuel_price_used,
    vehicle_type,
    updated_at
FROM audit 
WHERE trip_id = 'TEST-AUDIT-001';

-- 6. Test updating total_distance again (should update existing audit record)
UPDATE trips SET total_distance = 1500.25 WHERE trip_id = 'TEST-AUDIT-001';

-- 7. Verify the audit record was updated
SELECT 
    trip_id, 
    actual_distance, 
    actual_total_cost, 
    updated_at
FROM audit 
WHERE trip_id = 'TEST-AUDIT-001';

-- 8. Test with a new trip that has total_distance from the start
INSERT INTO trips (
    trip_id, 
    ordernumber, 
    rate, 
    status, 
    origin, 
    destination, 
    cargo,
    fuel_price_per_liter,
    total_distance
) VALUES (
    'TEST-AUDIT-002',
    'ORD-TEST-002', 
    '8000', 
    'completed', 
    'Durban', 
    'Pretoria', 
    'Electronics',
    22.00,
    600.50
);

-- 9. Check if audit record was created for the new trip
SELECT 
    trip_id, 
    actual_distance, 
    actual_total_cost, 
    fuel_price_used
FROM audit 
WHERE trip_id = 'TEST-AUDIT-002';

-- 10. Clean up test data (uncomment to remove test records)
-- DELETE FROM audit WHERE trip_id IN ('TEST-AUDIT-001', 'TEST-AUDIT-002');
-- DELETE FROM trips WHERE trip_id IN ('TEST-AUDIT-001', 'TEST-AUDIT-002');

-- Expected results:
-- Test 1: Should show no audit record initially
-- Test 2: Should create audit record with actual_distance = 1450.75, actual_total_cost = 15630.25
-- Test 3: Should update audit record with actual_distance = 1500.25, actual_total_cost = 15777.75
-- Test 4: Should create audit record immediately for new trip with total_distance
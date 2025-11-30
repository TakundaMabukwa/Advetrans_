-- Add route_points column to audit table and update trigger

-- 1. Add route_points column to audit table
ALTER TABLE audit ADD COLUMN IF NOT EXISTS route_points JSONB;

-- 2. Update the audit trigger function to include route_points
CREATE OR REPLACE FUNCTION copy_completed_trip_to_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_vehicle_type text := 'TAUTLINER';
    v_trip_days numeric := 1;
    v_fuel_price numeric := 21.55;
    v_actual_cost numeric := 0;
    v_planned_start timestamp with time zone;
    v_planned_finish timestamp with time zone;
    v_actual_start timestamp with time zone;
    v_actual_finish timestamp with time zone;
    v_planned_duration integer;
    v_actual_duration integer;
    
    -- Rate card variables
    rate_card_fuel numeric;
    rate_card_base numeric;
    rate_card_ppk numeric;
    rate_card_profit numeric;
    rate_card_extra_stop numeric;
    rate_card_standing_day numeric;
BEGIN
    RAISE NOTICE 'Enhanced audit trigger fired for trip_id: %, total_distance: %', NEW.trip_id, NEW.total_distance;
    
    -- Only process if total_distance is set and has changed
    IF NEW.total_distance IS NOT NULL AND 
       (OLD IS NULL OR OLD.total_distance IS NULL OR OLD.total_distance != NEW.total_distance) THEN
        
        RAISE NOTICE 'Processing audit for trip_id: %', NEW.trip_id;
        
        -- Extract vehicle type from stored trip data or vehicleassignments
        -- First try to get from stored selected_vehicle_type field
        IF NEW.selected_vehicle_type IS NOT NULL THEN
            v_vehicle_type := NEW.selected_vehicle_type;
        ELSIF NEW.vehicleassignments IS NOT NULL THEN
            SELECT INTO v_vehicle_type 
                COALESCE(
                    (SELECT vehicle_type FROM vehiclesc v 
                     WHERE v.registration_number = (NEW.vehicleassignments->0->'vehicle'->>'name')
                     LIMIT 1), 
                    'TAUTLINER'
                );
        END IF;
        
        -- Get fuel price
        v_fuel_price := COALESCE(NEW.fuel_price_per_liter, 21.55);
        
        -- Extract planned times from pickup/dropoff locations
        IF NEW.pickuplocations IS NOT NULL THEN
            v_planned_start := (NEW.pickuplocations->0->>'scheduled_time')::timestamp with time zone;
        END IF;
        
        IF NEW.dropofflocations IS NOT NULL THEN
            v_planned_finish := (NEW.dropofflocations->0->>'scheduled_time')::timestamp with time zone;
        END IF;
        
        -- Calculate planned duration
        IF v_planned_start IS NOT NULL AND v_planned_finish IS NOT NULL THEN
            v_planned_duration := EXTRACT(EPOCH FROM (v_planned_finish - v_planned_start)) / 60;
        END IF;
        
        -- Get actual times (these would be set when trip status changes)
        v_actual_start := NEW.actual_start_time;
        v_actual_finish := NEW.actual_end_time;
        
        -- Calculate actual duration
        IF v_actual_start IS NOT NULL AND v_actual_finish IS NOT NULL THEN
            v_actual_duration := EXTRACT(EPOCH FROM (v_actual_finish - v_actual_start)) / 60;
        END IF;
        
        -- Calculate trip days for standing day costs
        IF v_planned_start IS NOT NULL AND v_planned_finish IS NOT NULL THEN
            v_trip_days := GREATEST(1, EXTRACT(EPOCH FROM (v_planned_finish - v_planned_start)) / 86400);
        END IF;
        
        -- Apply complete rate card system matching frontend calculations
        CASE v_vehicle_type
            WHEN 'TAUTLINER' THEN
                rate_card_fuel := 4070; rate_card_base := 7280; rate_card_ppk := 3.00; 
                rate_card_profit := 0.111; rate_card_extra_stop := 0; rate_card_standing_day := 0;
            WHEN 'TAUT X-BRDER - BOTSWANA' THEN
                rate_card_fuel := 3500; rate_card_base := 6500; rate_card_ppk := 2.80;
                rate_card_profit := 0.10; rate_card_extra_stop := 500; rate_card_standing_day := 0;
            WHEN 'TAUT X-BRDER - NAMIBIA' THEN
                rate_card_fuel := 3800; rate_card_base := 7000; rate_card_ppk := 2.90;
                rate_card_profit := 0.10; rate_card_extra_stop := 500; rate_card_standing_day := 0;
            WHEN 'CITRUS LOAD (+1 DAY STANDING FPT)' THEN
                rate_card_fuel := 4070; rate_card_base := 7280; rate_card_ppk := 3.00;
                rate_card_profit := 0.111; rate_card_extra_stop := 0; rate_card_standing_day := 2000;
            WHEN '14M/15M COMBO (NEW)' THEN
                rate_card_fuel := 3200; rate_card_base := 6800; rate_card_ppk := 2.50;
                rate_card_profit := 0.12; rate_card_extra_stop := 300; rate_card_standing_day := 0;
            WHEN '14M/15M REEFER' THEN
                rate_card_fuel := 3500; rate_card_base := 7500; rate_card_ppk := 2.80;
                rate_card_profit := 0.12; rate_card_extra_stop := 400; rate_card_standing_day := 0;
            WHEN '9 METER (NEW)' THEN
                rate_card_fuel := 2800; rate_card_base := 5500; rate_card_ppk := 2.20;
                rate_card_profit := 0.11; rate_card_extra_stop := 250; rate_card_standing_day := 0;
            WHEN '8T JHB (NEW - EPS)' THEN
                rate_card_fuel := 2200; rate_card_base := 4800; rate_card_ppk := 1.80;
                rate_card_profit := 0.10; rate_card_extra_stop := 200; rate_card_standing_day := 0;
            WHEN '8T JHB (NEW) - X-BRDER - MOZ' THEN
                rate_card_fuel := 2400; rate_card_base := 5200; rate_card_ppk := 1.90;
                rate_card_profit := 0.10; rate_card_extra_stop := 300; rate_card_standing_day := 0;
            WHEN '8T JHB (OLD)' THEN
                rate_card_fuel := 2000; rate_card_base := 4200; rate_card_ppk := 1.60;
                rate_card_profit := 0.09; rate_card_extra_stop := 150; rate_card_standing_day := 0;
            WHEN '14 TON CURTAIN' THEN
                rate_card_fuel := 3400; rate_card_base := 6200; rate_card_ppk := 2.60;
                rate_card_profit := 0.11; rate_card_extra_stop := 350; rate_card_standing_day := 0;
            WHEN '1TON BAKKIE' THEN
                rate_card_fuel := 1200; rate_card_base := 2800; rate_card_ppk := 1.20;
                rate_card_profit := 0.08; rate_card_extra_stop := 100; rate_card_standing_day := 0;
            ELSE -- Default to TAUTLINER
                rate_card_fuel := 4070; rate_card_base := 7280; rate_card_ppk := 3.00;
                rate_card_profit := 0.111; rate_card_extra_stop := 0; rate_card_standing_day := 0;
        END CASE;
        
        -- Calculate actual cost using exact rate card formula from frontend
        -- Transport Cost = Fuel + Base + PPK + Standing Days
        v_actual_cost := rate_card_fuel + rate_card_base + (NEW.total_distance * rate_card_ppk) + 
                        (rate_card_standing_day * GREATEST(0, v_trip_days - 1));
        -- Total = Transport + Profit + Extra Stops
        v_actual_cost := v_actual_cost + (v_actual_cost * rate_card_profit) + rate_card_extra_stop;
        
        -- Insert or update audit record with comprehensive data including route_points
        INSERT INTO audit (
            trip_id, ordernumber, rate, status, startdate, end_date, cost_centre, origin, destination,
            cargo, cargo_weight, notes, drivers, vehicles, vehicle_assignments, pickup_locations,
            dropoff_locations, waypoints, selected_stop_points, stop_points, selected_client,
            client_details, status_notes, route, driver, vehicle, distance, costcentre, enddate,
            cargoweight, vehicleassignments, pickuplocations, dropofflocations, selectedstoppoints,
            stoppoints, selectedclient, clientdetails, statusnotes, created_at, updated_at,
            status_history, load_inspection_id, route_points,
            
            -- Planned values
            planned_start_time, planned_finish_time, planned_distance, planned_duration_minutes,
            planned_fuel_cost, planned_vehicle_cost, planned_driver_cost, planned_total_cost,
            
            -- Actual values
            actual_distance, actual_total_cost, actual_start_time, actual_finish_time, 
            actual_duration_minutes, fuel_price_used, vehicle_type,
            
            -- Variance calculations
            start_time_variance_minutes, finish_time_variance_minutes, distance_variance,
            duration_variance_minutes
        )
        VALUES (
            NEW.trip_id, NEW.ordernumber, NEW.rate, NEW.status, NEW.startdate, NEW.end_date,
            NEW.cost_centre, NEW.origin, NEW.destination, NEW.cargo, NEW.cargo_weight, NEW.notes,
            NEW.drivers, NEW.vehicles, NEW.vehicle_assignments, NEW.pickup_locations,
            NEW.dropoff_locations, NEW.waypoints, NEW.selected_stop_points, NEW.stop_points,
            NEW.selected_client, NEW.client_details, NEW.status_notes, NEW.route, NEW.driver,
            NEW.vehicle, NEW.distance, NEW.costcentre, NEW.enddate, NEW.cargoweight,
            NEW.vehicleassignments, NEW.pickuplocations, NEW.dropofflocations, NEW.selectedstoppoints,
            NEW.stoppoints, NEW.selectedclient, NEW.clientdetails, NEW.statusnotes, NEW.created_at,
            NOW(), NEW.status_history, NEW.load_inspection_id, NEW.route_points,
            
            -- Planned values
            v_planned_start, v_planned_finish, NEW.estimated_distance, v_planned_duration,
            NEW.approximate_fuel_cost, NEW.approximated_vehicle_cost, NEW.approximated_driver_cost,
            NEW.total_vehicle_cost,
            
            -- Actual values
            NEW.total_distance, v_actual_cost, v_actual_start, v_actual_finish, v_actual_duration,
            v_fuel_price, v_vehicle_type,
            
            -- Variance calculations
            CASE WHEN v_planned_start IS NOT NULL AND v_actual_start IS NOT NULL 
                 THEN EXTRACT(EPOCH FROM (v_actual_start - v_planned_start)) / 60 
                 ELSE NULL END,
            CASE WHEN v_planned_finish IS NOT NULL AND v_actual_finish IS NOT NULL 
                 THEN EXTRACT(EPOCH FROM (v_actual_finish - v_planned_finish)) / 60 
                 ELSE NULL END,
            CASE WHEN NEW.estimated_distance IS NOT NULL 
                 THEN NEW.total_distance - NEW.estimated_distance 
                 ELSE NULL END,
            CASE WHEN v_planned_duration IS NOT NULL AND v_actual_duration IS NOT NULL 
                 THEN v_actual_duration - v_planned_duration 
                 ELSE NULL END
        )
        ON CONFLICT (trip_id) DO UPDATE SET
            route_points = NEW.route_points,
            actual_distance = NEW.total_distance,
            actual_total_cost = v_actual_cost,
            actual_start_time = v_actual_start,
            actual_finish_time = v_actual_finish,
            actual_duration_minutes = v_actual_duration,
            fuel_price_used = v_fuel_price,
            vehicle_type = v_vehicle_type,
            updated_at = NOW(),
            
            -- Update variance calculations
            start_time_variance_minutes = CASE WHEN v_planned_start IS NOT NULL AND v_actual_start IS NOT NULL 
                                               THEN EXTRACT(EPOCH FROM (v_actual_start - v_planned_start)) / 60 
                                               ELSE NULL END,
            finish_time_variance_minutes = CASE WHEN v_planned_finish IS NOT NULL AND v_actual_finish IS NOT NULL 
                                                THEN EXTRACT(EPOCH FROM (v_actual_finish - v_planned_finish)) / 60 
                                                ELSE NULL END,
            distance_variance = CASE WHEN NEW.estimated_distance IS NOT NULL 
                                     THEN NEW.total_distance - NEW.estimated_distance 
                                     ELSE NULL END,
            duration_variance_minutes = CASE WHEN v_planned_duration IS NOT NULL AND v_actual_duration IS NOT NULL 
                                             THEN v_actual_duration - v_planned_duration 
                                             ELSE NULL END;
            
        RAISE NOTICE 'Enhanced audit record with route_points processed for trip_id: %', NEW.trip_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
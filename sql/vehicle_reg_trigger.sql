-- Function to update vehicle registration numbers in trip assignments
CREATE OR REPLACE FUNCTION update_vehicle_registrations()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vehicleassignments JSON to include registration numbers
    IF NEW.vehicleassignments IS NOT NULL AND NEW.vehicleassignments != '[]'::jsonb THEN
        NEW.vehicleassignments := (
            SELECT jsonb_agg(
                jsonb_set(
                    assignment,
                    '{vehicle,name}',
                    CASE 
                        WHEN assignment->'vehicle'->>'id' IS NOT NULL THEN
                            COALESCE(
                                (SELECT to_jsonb(registration_number) FROM vehiclesc WHERE id = (assignment->'vehicle'->>'id')::bigint),
                                '""'::jsonb
                            )
                        ELSE COALESCE(assignment->'vehicle'->'name', '""'::jsonb)
                    END
                )
            )
            FROM jsonb_array_elements(NEW.vehicleassignments) AS assignment
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_vehicle_registrations ON trips;
CREATE TRIGGER trigger_update_vehicle_registrations
    BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_registrations();
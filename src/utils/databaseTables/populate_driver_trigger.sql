-- Function to populate driver information from vehicleassignments
CREATE OR REPLACE FUNCTION populate_driver_info()
RETURNS TRIGGER AS $$
DECLARE
    assignment jsonb;
    driver_assignment jsonb;
    driver_record record;
    updated_assignments jsonb := '[]'::jsonb;
BEGIN
    -- Only process if vehicleassignments exists and is not empty
    IF NEW.vehicleassignments IS NOT NULL AND NEW.vehicleassignments != '[]'::jsonb THEN
        -- Loop through each vehicle assignment
        FOR assignment IN SELECT * FROM jsonb_array_elements(NEW.vehicleassignments)
        LOOP
            -- Process drivers in this assignment
            IF assignment ? 'drivers' AND jsonb_array_length(assignment->'drivers') > 0 THEN
                DECLARE
                    updated_drivers jsonb := '[]'::jsonb;
                    driver_item jsonb;
                BEGIN
                    -- Loop through drivers in this assignment
                    FOR driver_item IN SELECT * FROM jsonb_array_elements(assignment->'drivers')
                    LOOP
                        -- If driver has an ID, fetch from drivers table
                        IF driver_item ? 'id' AND (driver_item->>'id') != '' THEN
                            SELECT * INTO driver_record 
                            FROM drivers 
                            WHERE id = (driver_item->>'id')::bigint;
                            
                            -- If driver found, update the name with surname
                            IF FOUND THEN
                                updated_drivers := updated_drivers || jsonb_build_object(
                                    'id', driver_item->>'id',
                                    'name', COALESCE(driver_record.surname, ''),
                                    'first_name', COALESCE(driver_record.first_name, ''),
                                    'surname', COALESCE(driver_record.surname, '')
                                );
                            ELSE
                                -- Keep original if driver not found
                                updated_drivers := updated_drivers || driver_item;
                            END IF;
                        ELSE
                            -- Keep original if no ID
                            updated_drivers := updated_drivers || driver_item;
                        END IF;
                    END LOOP;
                    
                    -- Update the assignment with new drivers
                    assignment := assignment || jsonb_build_object('drivers', updated_drivers);
                END;
            END IF;
            
            -- Add updated assignment to the array
            updated_assignments := updated_assignments || assignment;
        END LOOP;
        
        -- Update the NEW record with populated driver info
        NEW.vehicleassignments := updated_assignments;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS populate_driver_info_trigger ON trips;
CREATE TRIGGER populate_driver_info_trigger
    BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION populate_driver_info();
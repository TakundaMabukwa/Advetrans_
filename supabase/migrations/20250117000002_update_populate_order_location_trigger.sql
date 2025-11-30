-- Update the populate_order_location_from_customer function to check location_verified flag
CREATE OR REPLACE FUNCTION populate_order_location_from_customer()
RETURNS TRIGGER AS $$
DECLARE
  customer_record RECORD;
BEGIN
  -- If customer_id is provided, check customer location status
  IF NEW.customer_id IS NOT NULL THEN
    -- Get customer data
    SELECT 
      c.latitude,
      c.longitude,
      c.location,
      c.location_group,
      COALESCE(c.location_verified, FALSE) as is_verified
    INTO customer_record
    FROM customers c
    WHERE c.customer_id = NEW.customer_id;
    
    IF FOUND THEN
      -- Customer exists - check if location is verified
      IF customer_record.is_verified = TRUE THEN
        -- Location verified - auto-fill coordinates
        NEW.latitude := customer_record.latitude;
        NEW.longitude := customer_record.longitude;
        NEW.location := customer_record.location;
        NEW.location_group := customer_record.location_group;
        NEW.needs_customer_setup := FALSE;
      ELSE
        -- Location NOT verified - only fill location text, flag for setup
        NEW.location := customer_record.location;
        NEW.latitude := NULL;
        NEW.longitude := NULL;
        NEW.location_group := NULL;
        NEW.needs_customer_setup := TRUE;
      END IF;
    ELSE
      -- Customer not found - flag for setup
      NEW.needs_customer_setup := TRUE;
    END IF;
  ELSE
    -- No customer_id provided - flag for setup
    NEW.needs_customer_setup := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_populate_order_location ON pending_orders;
CREATE TRIGGER trigger_populate_order_location 
  BEFORE INSERT OR UPDATE ON pending_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION populate_order_location_from_customer();

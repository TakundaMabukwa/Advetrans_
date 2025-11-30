-- Update pending_orders to better link with customers table
-- Add foreign key constraint if customer exists in customers table

-- First, ensure customer_id column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_orders' 
    AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.pending_orders 
    ADD COLUMN customer_id TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_orders' 
    AND column_name = 'needs_customer_setup'
  ) THEN
    ALTER TABLE public.pending_orders 
    ADD COLUMN needs_customer_setup BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add a function to auto-populate location from customers table
CREATE OR REPLACE FUNCTION populate_order_location_from_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- ALWAYS use customer coordinates if customer_id is provided
  IF NEW.customer_id IS NOT NULL THEN
    SELECT latitude, longitude, address, zone
    INTO NEW.latitude, NEW.longitude, NEW.location, NEW.location_group
    FROM customers
    WHERE customer_id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate location
DROP TRIGGER IF EXISTS trigger_populate_order_location ON pending_orders;
CREATE TRIGGER trigger_populate_order_location
  BEFORE INSERT OR UPDATE ON pending_orders
  FOR EACH ROW
  EXECUTE FUNCTION populate_order_location_from_customer();

-- Add comment to explain the relationship
COMMENT ON COLUMN pending_orders.customer_id IS 'Links to customers.customer_id for location and restriction lookup';

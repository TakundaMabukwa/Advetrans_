-- Add scheduled_date column to pending_orders table
ALTER TABLE pending_orders 
ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Add index for faster queries by scheduled_date
CREATE INDEX IF NOT EXISTS idx_pending_orders_scheduled_date 
ON pending_orders(scheduled_date);

-- Add comment to column
COMMENT ON COLUMN pending_orders.scheduled_date IS 'The date when this order is scheduled for delivery (used for 72-hour planning)';

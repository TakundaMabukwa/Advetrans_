-- Add drums column to pending_orders table
ALTER TABLE public.pending_orders 
ADD COLUMN IF NOT EXISTS drums INTEGER DEFAULT 0;

COMMENT ON COLUMN pending_orders.drums IS 'Number of 210L drums in the order';

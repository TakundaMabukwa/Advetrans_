-- Check pending_orders table structure
\d pending_orders;

-- Check for any constraints or triggers that might cause 400 errors
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_orders'
ORDER BY ordinal_position;

-- Check current pending orders
SELECT 
    id,
    customer_name,
    status,
    scheduled_date,
    assigned_vehicle_id,
    assigned_driver_id
FROM pending_orders 
WHERE id IN (2151, 2155, 2154, 2143, 2153, 2158);
-- Check vehicle capacities
SELECT registration_number, load_capacity, vehicle_type 
FROM vehiclesc 
ORDER BY CAST(load_capacity AS INTEGER) DESC;

-- Check heavy orders that can't fit
SELECT customer_name, total_weight, trip_id
FROM pending_orders 
WHERE total_weight > 3000
ORDER BY total_weight DESC;

-- Update vehicle capacities if they're too low
UPDATE vehiclesc SET load_capacity = '5000' WHERE registration_number = 'CN32070';
UPDATE vehiclesc SET load_capacity = '8000' WHERE registration_number = 'CN33826';
UPDATE vehiclesc SET load_capacity = '6000' WHERE registration_number = 'CN30847';
-- Check vehicle capacities and restrictions
SELECT 
    registration_number,
    load_capacity,
    restrictions,
    vehicle_type,
    description
FROM vehiclesc 
ORDER BY CAST(load_capacity AS INTEGER) DESC;

-- Check for orders that are too heavy for any vehicle
SELECT 
    customer_name,
    total_weight,
    drums,
    location
FROM pending_orders 
WHERE total_weight > (SELECT MAX(CAST(load_capacity AS INTEGER)) FROM vehiclesc)
ORDER BY total_weight DESC;
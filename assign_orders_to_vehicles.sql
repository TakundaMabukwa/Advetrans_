-- Mission Trailer Vehicle Assignment Script
-- Assign and fill orders to vehicles based on capacity and location

-- Step 1: Check available vehicles and their capacities
SELECT 
    id,
    registration_number,
    CAST(load_capacity AS INTEGER) as capacity_kg,
    vehicle_type,
    restrictions
FROM vehiclesc 
WHERE is_active = true
ORDER BY CAST(load_capacity AS INTEGER) DESC;

-- Step 2: Check unassigned orders
SELECT 
    id,
    customer_name,
    total_weight,
    drums,
    location,
    status
FROM pending_orders 
WHERE status = 'unassigned'
ORDER BY total_weight DESC;

-- Step 3: Assign orders to vehicles (Mission Trailer specific)
-- Start with largest capacity vehicles and heaviest orders

-- Assign to CN32070 (5000kg capacity)
UPDATE pending_orders 
SET 
    assigned_vehicle_id = (SELECT id FROM vehiclesc WHERE registration_number = 'CN32070'),
    status = 'assigned',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM pending_orders 
    WHERE status = 'unassigned' 
    AND total_weight <= 5000
    ORDER BY total_weight DESC
    LIMIT 1
);

-- Assign to CN33826 (8000kg capacity) 
UPDATE pending_orders 
SET 
    assigned_vehicle_id = (SELECT id FROM vehiclesc WHERE registration_number = 'CN33826'),
    status = 'assigned',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM pending_orders 
    WHERE status = 'unassigned' 
    AND total_weight <= 8000
    ORDER BY total_weight DESC
    LIMIT 1
);

-- Assign to CN30847 (6000kg capacity)
UPDATE pending_orders 
SET 
    assigned_vehicle_id = (SELECT id FROM vehiclesc WHERE registration_number = 'CN30847'),
    status = 'assigned',
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM pending_orders 
    WHERE status = 'unassigned' 
    AND total_weight <= 6000
    ORDER BY total_weight DESC
    LIMIT 1
);

-- Step 4: Fill remaining capacity with smaller orders
-- For CN33826 (highest capacity vehicle)
WITH vehicle_load AS (
    SELECT 
        v.id as vehicle_id,
        v.registration_number,
        CAST(v.load_capacity AS INTEGER) as max_capacity,
        COALESCE(SUM(po.total_weight), 0) as current_load
    FROM vehiclesc v
    LEFT JOIN pending_orders po ON v.id = po.assigned_vehicle_id
    WHERE v.registration_number = 'CN33826'
    GROUP BY v.id, v.registration_number, v.load_capacity
)
UPDATE pending_orders 
SET 
    assigned_vehicle_id = (SELECT vehicle_id FROM vehicle_load),
    status = 'assigned',
    updated_at = NOW()
WHERE id IN (
    SELECT po.id 
    FROM pending_orders po, vehicle_load vl
    WHERE po.status = 'unassigned'
    AND po.total_weight <= (vl.max_capacity - vl.current_load)
    ORDER BY po.total_weight DESC
    LIMIT 3
);

-- Step 5: Verify assignments
SELECT 
    v.registration_number,
    v.load_capacity,
    COUNT(po.id) as assigned_orders,
    SUM(po.total_weight) as total_weight,
    ROUND((SUM(po.total_weight) / CAST(v.load_capacity AS INTEGER)) * 100, 2) as capacity_utilization
FROM vehiclesc v
LEFT JOIN pending_orders po ON v.id = po.assigned_vehicle_id AND po.status = 'assigned'
WHERE v.registration_number IN ('CN32070', 'CN33826', 'CN30847')
GROUP BY v.id, v.registration_number, v.load_capacity
ORDER BY capacity_utilization DESC;

-- Step 6: Show remaining unassigned orders
SELECT 
    id,
    customer_name,
    total_weight,
    location,
    'Requires manual assignment' as reason
FROM pending_orders 
WHERE status = 'unassigned'
ORDER BY total_weight DESC;
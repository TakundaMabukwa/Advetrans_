-- View to see vehicle capacity usage per day
CREATE OR REPLACE VIEW vehicle_daily_capacity AS
SELECT 
    v.id as vehicle_id,
    v.registration_number,
    v.load_capacity,
    po.scheduled_date,
    COUNT(po.id) as order_count,
    COALESCE(SUM(po.total_weight), 0) as total_weight_assigned,
    v.load_capacity - COALESCE(SUM(po.total_weight), 0) as available_capacity,
    ROUND((COALESCE(SUM(po.total_weight), 0) / NULLIF(v.load_capacity, 0) * 100)::numeric, 2) as utilization_percent
FROM vehiclesc v
LEFT JOIN pending_orders po ON po.assigned_vehicle_id = v.id 
    AND po.status IN ('assigned', 'in-trip')
    AND po.scheduled_date IS NOT NULL
WHERE v.load_capacity IS NOT NULL AND v.load_capacity > 0
GROUP BY v.id, v.registration_number, v.load_capacity, po.scheduled_date
ORDER BY po.scheduled_date DESC NULLS LAST, v.registration_number;

-- Query to check today's vehicle capacity
-- SELECT * FROM vehicle_daily_capacity WHERE scheduled_date = CURRENT_DATE;

-- Query to check specific date
-- SELECT * FROM vehicle_daily_capacity WHERE scheduled_date = '2024-01-15';

-- Function to schedule unassigned orders for next available day (72-hour planning window)
-- This function should be run daily (e.g., via cron job at end of day)

CREATE OR REPLACE FUNCTION schedule_unassigned_orders()
RETURNS TABLE(
    scheduled_count INTEGER,
    message TEXT
) AS $$
DECLARE
    schedule_count INTEGER := 0;
BEGIN
    -- Schedule unassigned orders from previous days to next available day within 72 hours
    UPDATE pending_orders 
    SET 
        scheduled_date = CASE 
            WHEN scheduled_date IS NULL OR scheduled_date < CURRENT_DATE THEN 
                CURRENT_DATE + INTERVAL '1 day'
            WHEN scheduled_date = CURRENT_DATE THEN 
                CURRENT_DATE + INTERVAL '1 day'
            WHEN scheduled_date = CURRENT_DATE + INTERVAL '1 day' THEN 
                CURRENT_DATE + INTERVAL '2 day'
            ELSE 
                CURRENT_DATE + INTERVAL '3 day'
        END,
        priority = COALESCE(priority, 0) + 1,
        status = 'scheduled'
    WHERE 
        status = 'unassigned' 
        AND (scheduled_date IS NULL OR scheduled_date <= CURRENT_DATE + INTERVAL '3 days');
    
    GET DIAGNOSTICS schedule_count = ROW_COUNT;
    
    -- Return results
    RETURN QUERY SELECT 
        schedule_count,
        CASE 
            WHEN schedule_count > 0 THEN 
                'Scheduled ' || schedule_count || ' orders for next available days within 72-hour window'
            ELSE 
                'No orders to schedule'
        END;
END;
$$ LANGUAGE plpgsql;

-- Add priority and scheduled_date columns if they don't exist
ALTER TABLE pending_orders 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_date DATE NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_orders_priority_created 
ON pending_orders(priority DESC, created_at ASC) 
WHERE status IN ('unassigned', 'scheduled');

CREATE INDEX IF NOT EXISTS idx_pending_orders_scheduled_date 
ON pending_orders(scheduled_date, priority DESC) 
WHERE status IN ('unassigned', 'scheduled');

-- Function to get prioritized orders for a specific date (default today)
CREATE OR REPLACE FUNCTION get_prioritized_orders_for_date(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    id INTEGER,
    trip_id TEXT,
    customer_name TEXT,
    total_weight NUMERIC,
    location TEXT,
    location_group TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    drums INTEGER,
    priority INTEGER,
    created_at TIMESTAMP,
    scheduled_date DATE
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        po.id,
        po.trip_id,
        po.customer_name,
        po.total_weight,
        po.location,
        po.location_group,
        po.latitude,
        po.longitude,
        po.drums,
        COALESCE(po.priority, 0) as priority,
        po.created_at,
        po.scheduled_date
    FROM pending_orders po
    WHERE (po.status IN ('unassigned', 'scheduled'))
      AND (po.scheduled_date IS NULL OR po.scheduled_date <= target_date)
      AND (po.scheduled_date IS NULL OR po.scheduled_date >= CURRENT_DATE)
    ORDER BY 
        COALESCE(po.priority, 0) DESC,  -- Higher priority first
        po.created_at ASC;              -- Older orders first within same priority
END;
$$ LANGUAGE plpgsql;

-- Function to get orders for next 3 days planning
CREATE OR REPLACE FUNCTION get_orders_for_planning_window()
RETURNS TABLE(
    planning_date DATE,
    order_count INTEGER,
    total_weight NUMERIC
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        COALESCE(po.scheduled_date, CURRENT_DATE) as planning_date,
        COUNT(*)::INTEGER as order_count,
        SUM(po.total_weight) as total_weight
    FROM pending_orders po
    WHERE po.status IN ('unassigned', 'scheduled')
      AND (po.scheduled_date IS NULL OR po.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days')
    GROUP BY COALESCE(po.scheduled_date, CURRENT_DATE)
    ORDER BY planning_date;
END;
$$ LANGUAGE plpgsql;
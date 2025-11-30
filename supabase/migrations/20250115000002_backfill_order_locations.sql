-- Backfill existing pending_orders with customer location data
UPDATE public.pending_orders po
SET 
  latitude = c.latitude,
  longitude = c.longitude,
  location = COALESCE(po.location, c.address),
  location_group = COALESCE(po.location_group, c.zone)
FROM public.customers c
WHERE po.customer_id = c.customer_id
  AND (po.latitude IS NULL OR po.longitude IS NULL);

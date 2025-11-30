-- Add route_geometry column to pending_orders table to store optimized routes
ALTER TABLE pending_orders 
ADD COLUMN IF NOT EXISTS route_geometry JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_orders_route_geometry 
ON pending_orders USING GIN (route_geometry);

-- Add comment
COMMENT ON COLUMN pending_orders.route_geometry IS 'Stores Mapbox optimized route geometry in GeoJSON format';

-- ALTER statements to add missing columns and modify existing ones to match the latest version

-- Add missing columns
ALTER TABLE public.trips ADD COLUMN approximate_fuel_cost numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN approximated_cpk numeric(10, 4);
ALTER TABLE public.trips ADD COLUMN approximated_vehicle_cost numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN approximated_driver_cost numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN total_vehicle_cost numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN goods_in_transit_premium numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN estimated_distance numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN fuel_price_per_liter numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN trip_type character varying(20) DEFAULT 'local'::character varying;
ALTER TABLE public.trips ADD COLUMN current_latitude numeric(10, 8);
ALTER TABLE public.trips ADD COLUMN current_longitude numeric(11, 8);
ALTER TABLE public.trips ADD COLUMN current_speed numeric(5, 2) DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN last_location_update timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN route_points jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.trips ADD COLUMN unauthorized_stops_count integer DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN last_break_time timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN break_reminder_due boolean DEFAULT false;
ALTER TABLE public.trips ADD COLUMN driving_hours numeric(5, 2) DEFAULT 0;
ALTER TABLE public.trips ADD COLUMN alert_message text;
ALTER TABLE public.trips ADD COLUMN alert_type text;
ALTER TABLE public.trips ADD COLUMN alert_timestamp timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN accepted_at timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN loading_location_lat numeric(10, 8);
ALTER TABLE public.trips ADD COLUMN loading_location_lng numeric(11, 8);
ALTER TABLE public.trips ADD COLUMN loading_location_radius numeric(5, 2) DEFAULT 100;
ALTER TABLE public.trips ADD COLUMN late_acceptance boolean DEFAULT false;
ALTER TABLE public.trips ADD COLUMN late_arrival boolean DEFAULT false;
ALTER TABLE public.trips ADD COLUMN start_mileage numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN end_mileage numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN total_distance numeric(10, 2);
ALTER TABLE public.trips ADD COLUMN route_history text;
ALTER TABLE public.trips ADD COLUMN breaks jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.trips ADD COLUMN actual_start_time timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN actual_end_time timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN origin_coordinates jsonb;
ALTER TABLE public.trips ADD COLUMN destination_coordinates jsonb;
ALTER TABLE public.trips ADD COLUMN departure_radius numeric(5, 2) DEFAULT 500;
ALTER TABLE public.trips ADD COLUMN arrival_radius numeric(5, 2) DEFAULT 500;
ALTER TABLE public.trips ADD COLUMN selected_vehicle_type text;

-- Modify existing columns to match latest version
ALTER TABLE public.trips ALTER COLUMN status SET NOT NULL;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_trips_breaks_gin ON public.trips USING gin (breaks) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_trips_actual_times ON public.trips USING btree (actual_start_time, actual_end_time) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_trips_status_updated ON public.trips USING btree (status, updated_at) TABLESPACE pg_default WHERE (status <> 'completed'::text);
CREATE INDEX IF NOT EXISTS idx_trips_alert_type ON public.trips USING btree (alert_type, alert_timestamp) TABLESPACE pg_default WHERE (alert_type IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_trips_location_update ON public.trips USING btree (last_location_update) TABLESPACE pg_default WHERE (last_location_update IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_trips_route_points ON public.trips USING gin (route_points) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_trips_vehicleassignments_gin ON public.trips USING gin (vehicleassignments) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_trips_drivers_gin ON public.trips USING gin (drivers) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_trips_vehicles_gin ON public.trips USING gin (vehicles) TABLESPACE pg_default;
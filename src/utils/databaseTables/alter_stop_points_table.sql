-- ALTER statements to add missing columns to match the first version

-- Add missing columns
ALTER TABLE public.stop_points ADD COLUMN color text;
ALTER TABLE public.stop_points ADD COLUMN outline text;
ALTER TABLE public.stop_points ADD COLUMN style_url text;
ALTER TABLE public.stop_points ADD COLUMN name2 text;
ALTER TABLE public.stop_points ADD COLUMN value text;
ALTER TABLE public.stop_points ADD COLUMN radius numeric(10, 2) DEFAULT 100;
ALTER TABLE public.stop_points ADD COLUMN coordinates5 text;
ALTER TABLE public.stop_points ADD COLUMN coordinates6 text;

-- Create missing index
CREATE INDEX IF NOT EXISTS idx_stop_points_name ON public.stop_points USING btree (name) TABLESPACE pg_default;
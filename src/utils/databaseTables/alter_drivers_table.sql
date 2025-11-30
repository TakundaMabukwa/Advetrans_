-- ALTER statements to add missing columns from first version to second version

-- Add missing columns
ALTER TABLE public.drivers ADD COLUMN apointment_date date;
ALTER TABLE public.drivers ADD COLUMN passport_expiry date;
ALTER TABLE public.drivers ADD COLUMN appointment_date date;
ALTER TABLE public.drivers ADD COLUMN "hazCamDate" date;
ALTER TABLE public.drivers ADD COLUMN medic_exam_date date;
ALTER TABLE public.drivers ADD COLUMN pop text;
ALTER TABLE public.drivers ADD COLUMN passport_status text;
ALTER TABLE public.drivers ADD COLUMN available boolean DEFAULT true;
ALTER TABLE public.drivers ADD COLUMN salary numeric(10, 2);
ALTER TABLE public.drivers ADD COLUMN hourly_rate numeric(10, 2);

-- Modify existing columns to match first version
ALTER TABLE public.drivers ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.drivers ALTER COLUMN surname DROP NOT NULL;
ALTER TABLE public.drivers ALTER COLUMN id_or_passport_number DROP NOT NULL;
ALTER TABLE public.drivers ALTER COLUMN status TYPE text;

-- Change identity generation method
ALTER TABLE public.drivers ALTER COLUMN id SET GENERATED ALWAYS;

-- Create the missing index
CREATE INDEX IF NOT EXISTS idx_drivers_surname ON public.drivers USING btree (surname) TABLESPACE pg_default
WHERE (surname IS NOT NULL);
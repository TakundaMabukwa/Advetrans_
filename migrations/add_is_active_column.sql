-- Add is_active column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to be active by default
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

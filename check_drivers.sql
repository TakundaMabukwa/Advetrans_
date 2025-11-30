-- Check driver availability
SELECT 
    id,
    first_name,
    surname,
    available,
    license_code
FROM drivers 
ORDER BY available DESC, first_name;

-- Update all drivers to available for testing
UPDATE drivers SET available = true WHERE available = false;
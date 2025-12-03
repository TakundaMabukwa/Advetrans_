const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function findMissingDrivers() {
    // Read Excel file
    const workbook = XLSX.readFile('EPS DRIVER CODES (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    // Get drivers from database
    const { data: dbDrivers, error } = await supabase
        .from('drivers')
        .select('first_name, surname');

    if (error) {
        console.error('Error fetching drivers:', error);
        return;
    }

    // Create lookup map for DB drivers
    const dbMap = new Set();
    dbDrivers.forEach(driver => {
        const surnameOnly = (driver.surname || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (surnameOnly) {
            dbMap.add(surnameOnly);
        }
        
        const fullName = `${driver.first_name || ''} ${driver.surname || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        if (fullName && fullName !== surnameOnly && driver.first_name) {
            dbMap.add(fullName);
        }
    });

    const missingDrivers = [];
    
    // Find Excel drivers not in database
    excelData.forEach(excelRow => {
        const excelFullName = `${excelRow['First Name'] || ''} ${excelRow['Last Name'] || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        
        if (excelFullName && !dbMap.has(excelFullName)) {
            missingDrivers.push({
                name: `${excelRow['First Name']} ${excelRow['Last Name']}`,
                code: excelRow['Code']
            });
        }
    });

    console.log('=== DRIVERS IN EXCEL BUT NOT IN DATABASE ===\n');
    
    missingDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name} (Code: ${driver.code})`);
    });

    console.log(`\nTotal missing drivers: ${missingDrivers.length}`);
    console.log(`Total Excel drivers: ${excelData.length}`);
    console.log(`Total DB drivers: ${dbDrivers.length}`);
}

findMissingDrivers();
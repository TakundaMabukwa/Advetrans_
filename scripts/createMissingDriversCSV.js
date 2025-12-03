const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingDriversCSV() {
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

    // Create comprehensive lookup map for DB drivers
    const dbMap = new Set();
    dbDrivers.forEach(driver => {
        // Add surname only (full name might be in surname field)
        const surnameOnly = (driver.surname || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (surnameOnly) {
            dbMap.add(surnameOnly);
        }
        
        // Add first_name + surname combination
        const fullName = `${driver.first_name || ''} ${driver.surname || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        if (fullName && fullName !== surnameOnly && driver.first_name) {
            dbMap.add(fullName);
        }
    });

    const missingDrivers = [];
    
    // Find Excel drivers not in database
    excelData.forEach(excelRow => {
        const firstName = (excelRow['First Name'] || '').trim();
        const lastName = (excelRow['Last Name'] || '').trim();
        const excelFullName = `${firstName} ${lastName}`.trim().toLowerCase().replace(/\s+/g, ' ');
        
        if (excelFullName && !dbMap.has(excelFullName)) {
            missingDrivers.push({
                first_name: firstName,
                surname: lastName,
                full_name: `${firstName} ${lastName}`,
                driver_code: `EPS${excelRow['Code']}`,
                excel_code: excelRow['Code']
            });
        }
    });

    // Create CSV content
    const csvHeader = 'first_name,surname,full_name,driver_code,excel_code\n';
    const csvRows = missingDrivers.map(driver => 
        `"${driver.first_name}","${driver.surname}","${driver.full_name}","${driver.driver_code}","${driver.excel_code}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;

    // Write CSV file
    fs.writeFileSync('missing_drivers.csv', csvContent);

    console.log(`Created missing_drivers.csv with ${missingDrivers.length} drivers`);
    console.log('CSV columns: first_name, surname, full_name, driver_code, excel_code');
    console.log('\nFirst 5 missing drivers:');
    missingDrivers.slice(0, 5).forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.full_name} (Code: ${driver.driver_code})`);
    });
}

createMissingDriversCSV();
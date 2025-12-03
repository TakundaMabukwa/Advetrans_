const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function generateUpdateQueries() {
    // Read Excel file
    const workbook = XLSX.readFile('EPS DRIVER CODES (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    // Get drivers from database
    const { data: dbDrivers, error } = await supabase
        .from('drivers')
        .select('id, first_name, surname, driver_code, id_or_passport_number, id_or_passport_document');

    if (error) {
        console.error('Error fetching drivers:', error);
        return;
    }

    // Create lookup map
    const dbMap = new Map();
    dbDrivers.forEach(driver => {
        const addToMap = (key, driver) => {
            if (!dbMap.has(key)) {
                dbMap.set(key, []);
            }
            dbMap.get(key).push(driver);
        };
        
        const surnameOnly = (driver.surname || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (surnameOnly) {
            addToMap(surnameOnly, driver);
        }
        
        const fullName = `${driver.first_name || ''} ${driver.surname || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        if (fullName && fullName !== surnameOnly && driver.first_name) {
            addToMap(fullName, driver);
        }
    });

    const updates = [];
    
    // Find matches and generate updates
    excelData.forEach(excelRow => {
        const excelFullName = `${excelRow['First Name'] || ''} ${excelRow['Last Name'] || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        const excelCode = excelRow['Code'];
        
        if (excelFullName && dbMap.has(excelFullName)) {
            dbMap.get(excelFullName).forEach(dbDriver => {
                updates.push({
                    id: dbDriver.id,
                    newCode: `EPS${excelCode}`,
                    currentCode: dbDriver.driver_code,
                    name: dbDriver.surname || `${dbDriver.first_name} ${dbDriver.surname}`
                });
            });
        }
    });

    console.log('-- SQL UPDATE QUERIES FOR DRIVER CODES --\n');
    
    updates.forEach(update => {
        console.log(`-- ${update.name} (ID: ${update.id}) - Current: ${update.currentCode} -> New: ${update.newCode}`);
        console.log(`UPDATE drivers SET driver_code = '${update.newCode}' WHERE id = ${update.id};`);
        console.log('');
    });

    console.log(`\n-- Total updates: ${updates.length}`);
    console.log(`-- Unique drivers: ${new Set(updates.map(u => u.id)).size}`);
}

generateUpdateQueries();
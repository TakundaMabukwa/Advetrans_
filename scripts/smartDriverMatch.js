const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function smartDriverMatch() {
    // Read Excel file
    const workbook = XLSX.readFile('EPS DRIVER CODES (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    // Get drivers from database
    const { data: dbDrivers, error } = await supabase
        .from('drivers')
        .select('id, first_name, surname, driver_code');

    if (error) {
        console.error('Error fetching drivers:', error);
        return;
    }

    // Group Excel data by surname
    const excelBySurname = {};
    excelData.forEach(row => {
        const surname = (row['Last Name'] || '').trim().toUpperCase();
        const firstName = (row['First Name'] || '').trim();
        const code = row['Code'];
        
        if (!excelBySurname[surname]) {
            excelBySurname[surname] = [];
        }
        excelBySurname[surname].push({ firstName, code });
    });

    // Group DB drivers by surname
    const dbBySurname = {};
    dbDrivers.forEach(driver => {
        const surname = (driver.surname || '').trim().toUpperCase();
        if (!dbBySurname[surname]) {
            dbBySurname[surname] = [];
        }
        dbBySurname[surname].push(driver);
    });

    const updates = [];

    // Match surnames
    Object.keys(excelBySurname).forEach(surname => {
        if (dbBySurname[surname]) {
            const excelEntries = excelBySurname[surname];
            const dbEntries = dbBySurname[surname];

            if (excelEntries.length === 1 && dbEntries.length === 1) {
                // Unique surname - direct match
                updates.push({
                    id: dbEntries[0].id,
                    newCode: `EPS${excelEntries[0].code}`,
                    currentCode: dbEntries[0].driver_code,
                    dbName: dbEntries[0].surname,
                    dbFirstName: dbEntries[0].first_name,
                    excelFirstName: excelEntries[0].firstName,
                    matchType: 'unique_surname'
                });
            } else if (excelEntries.length > 1 || dbEntries.length > 1) {
                // Multiple entries - match by first name
                excelEntries.forEach(excelEntry => {
                    dbEntries.forEach(dbEntry => {
                        const dbFirstNameNorm = (dbEntry.first_name || '').trim().toUpperCase();
                        const dbSurnameWords = (dbEntry.surname || '').trim().toUpperCase().split(' ');
                        const excelFirstNameNorm = excelEntry.firstName.trim().toUpperCase();
                        
                        // Check if Excel first name matches DB first_name or is contained in DB surname
                        if (dbFirstNameNorm === excelFirstNameNorm || 
                            dbSurnameWords.some(word => word === excelFirstNameNorm)) {
                            updates.push({
                                id: dbEntry.id,
                                newCode: `EPS${excelEntry.code}`,
                                currentCode: dbEntry.driver_code,
                                dbName: dbEntry.surname,
                                dbFirstName: dbEntry.first_name,
                                excelFirstName: excelEntry.firstName,
                                matchType: 'first_name_match'
                            });
                        }
                    });
                });
            }
        }
    });

    console.log('-- SMART DRIVER CODE UPDATE QUERIES --\n');
    
    updates.forEach(update => {
        console.log(`-- ${update.matchType.toUpperCase()}: Excel "${update.excelFirstName}" -> DB "${update.dbFirstName} ${update.dbName}" (ID: ${update.id})`);
        console.log(`-- Current: ${update.currentCode} -> New: ${update.newCode}`);
        console.log(`UPDATE drivers SET driver_code = '${update.newCode}' WHERE id = ${update.id};`);
        console.log('');
    });

    console.log(`\n-- Total updates: ${updates.length}`);
    console.log(`-- Unique surname matches: ${updates.filter(u => u.matchType === 'unique_surname').length}`);
    console.log(`-- First name matches: ${updates.filter(u => u.matchType === 'first_name_match').length}`);
}

smartDriverMatch();
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function compareDrivers() {
    // Read Excel file
    const workbook = XLSX.readFile('EPS DRIVER CODES (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${excelData.length} drivers in Excel file\n`);

    // Get drivers from database
    const { data: dbDrivers, error } = await supabase
        .from('drivers')
        .select('id, first_name, surname, driver_code, id_or_passport_number, id_or_passport_document');

    if (error) {
        console.error('Error fetching drivers:', error);
        return;
    }

    console.log(`Found ${dbDrivers.length} drivers in database\n`);

    // Create lookup map for faster matching
    const dbMap = new Map();
    dbDrivers.forEach(driver => {
        const addToMap = (key, driver) => {
            if (!dbMap.has(key)) {
                dbMap.set(key, []);
            }
            dbMap.get(key).push(driver);
        };
        
        // Try surname only (full name might be in surname field)
        const surnameOnly = (driver.surname || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (surnameOnly) {
            addToMap(surnameOnly, driver);
        }
        
        // Try first_name + surname combination
        const fullName = `${driver.first_name || ''} ${driver.surname || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        if (fullName && fullName !== surnameOnly && driver.first_name) {
            addToMap(fullName, driver);
        }
    });

    let matchCount = 0;
    const matches = [];

    // Compare using map lookup - check both patterns
    excelData.forEach(excelRow => {
        const excelFullName = `${excelRow['First Name'] || ''} ${excelRow['Last Name'] || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        const excelCode = excelRow['Code'];
        
        if (!excelFullName) return;
        
        // Check if Excel name matches any DB pattern
        if (dbMap.has(excelFullName)) {
            dbMap.get(excelFullName).forEach(dbDriver => {
                matchCount++;
                matches.push({
                    excelName: `${excelRow['First Name']} ${excelRow['Last Name']}`,
                    excelCode: excelCode,
                    dbName: dbDriver.surname,
                    dbFirstName: dbDriver.first_name,
                    dbCode: dbDriver.driver_code,
                    dbId: dbDriver.id,
                    dbIdNumber: dbDriver.id_or_passport_number || dbDriver.id_or_passport_document,
                    matchType: dbDriver.first_name ? 'first+surname' : 'surname_only'
                });
            });
        }
    });


    // Check for duplicate ID numbers (from both fields)
    const duplicateIds = new Map();
    matches.forEach(match => {
        if (match.dbIdNumber) {
            if (!duplicateIds.has(match.dbIdNumber)) {
                duplicateIds.set(match.dbIdNumber, []);
            }
            duplicateIds.get(match.dbIdNumber).push(match);
        }
    });

    console.log('=== MATCHES FOUND ===\n');
    matches.forEach((match, index) => {
        console.log(`${index + 1}. Excel: "${match.excelName}" (Code: ${match.excelCode})`);
        const dbFullName = match.dbFirstName ? `${match.dbFirstName} ${match.dbName}` : match.dbName;
        const idInfo = match.dbIdNumber ? ` ID: ${match.dbIdNumber}` : ' ID: NULL';
        console.log(`   DB: "${dbFullName}" (Code: ${match.dbCode || 'NULL'}) [DB_ID: ${match.dbId}]${idInfo} (${match.matchType})\n`);
    });

    console.log('\n=== DUPLICATE ID NUMBERS ===\n');
    duplicateIds.forEach((matches, idNumber) => {
        if (matches.length > 1) {
            console.log(`ID Number: ${idNumber} (${matches.length} drivers)`);
            matches.forEach(match => {
                const dbFullName = match.dbFirstName ? `${match.dbFirstName} ${match.dbName}` : match.dbName;
                console.log(`  - "${dbFullName}" [DB_ID: ${match.dbId}] (${match.matchType})`);
            });
            console.log('');
        }
    });

    // Check for Excel duplicates
    const excelDuplicates = new Map();
    excelData.forEach(row => {
        const fullName = `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
        if (fullName) {
            if (!excelDuplicates.has(fullName)) {
                excelDuplicates.set(fullName, []);
            }
            excelDuplicates.get(fullName).push(row);
        }
    });

    console.log('\n=== EXCEL DUPLICATES ===\n');
    excelDuplicates.forEach((rows, name) => {
        if (rows.length > 1) {
            console.log(`Name: "${rows[0]['First Name']} ${rows[0]['Last Name']}" (${rows.length} entries)`);
            rows.forEach(row => {
                console.log(`  - Code: ${row['Code']}`);
            });
            console.log('');
        }
    });

    console.log(`\nTotal matches: ${matchCount}`);
    console.log(`Unique drivers matched: ${new Set(matches.map(m => m.dbId)).size}`);
    
    const surnameOnlyMatches = matches.filter(m => m.matchType === 'surname_only').length;
    const firstSurnameMatches = matches.filter(m => m.matchType === 'first+surname').length;
    console.log(`Surname only matches: ${surnameOnlyMatches}`);
    console.log(`First+Surname matches: ${firstSurnameMatches}`);
    
    const duplicateIdCount = Array.from(duplicateIds.values()).filter(arr => arr.length > 1).length;
    console.log(`Drivers with duplicate ID numbers: ${duplicateIdCount}`);
    
    const withIdNumbers = matches.filter(m => m.dbIdNumber).length;
    console.log(`Drivers with ID numbers (either field): ${withIdNumbers}`);
    console.log(`Drivers without ID numbers: ${matchCount - withIdNumbers}`);
    
    const excelDuplicateCount = Array.from(excelDuplicates.values()).filter(arr => arr.length > 1).length;
    console.log(`Excel duplicate names: ${excelDuplicateCount}`);
}

compareDrivers();

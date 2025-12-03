const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://ihegfiqnobewpwcewrae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZWdmaXFub2Jld3B3Y2V3cmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzAzNjAsImV4cCI6MjA3NTg0NjM2MH0.xaxkB2Br7cQTQRD-PSheiKTY3Rg3jvqsA_pQn1JWS2I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function importClients(excelFilePath) {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(excelFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // Skip header row
    const rows = data.slice(1)
    
    const clients = rows.map((row, index) => {
      // Debug first few rows
      if (index < 3) {
        console.log(`Row ${index + 1}:`, row)
      }
      // Map Excel columns - counting actual positions from your sample
      const [
        accNo,           // 0 - Acc No
        customer,        // 1 - Customer  
        creditLimit,     // 2 - Credit Limit
        address1,        // 3 - Address part 1
        address2,        // 4 - Address part 2  
        address3,        // 5 - Address part 3
        ,                // 6 - Empty
        ,                // 7 - Empty
        postal1,         // 8 - Postal part 1
        postal2,         // 9 - Postal part 2
        postal3,         // 10 - Postal part 3
        ,                // 11 - Empty
        ,                // 12 - Empty
        phone,           // 13 - Phone
        contact,         // 14 - Contact
        faxNumber,       // 15 - Fax number
        vatNumber,       // 16 - Vat Number
        vatYN,           // 17 - VAT(Y/N)
        dormantYN,       // 18 - Dormant(Y/N)
        regNumber,       // 19 - Registration Number
        regName          // 20 - Registration Name
      ] = row

      // Combine address parts (D-F)
      const fullAddress = [address1, address2, address3]
        .filter(part => part && part.toString().trim())
        .join(', ')

      // Combine postal parts (I-K)
      const postalCode = [postal1, postal2, postal3]
        .filter(part => part && part.toString().trim())
        .join(' ')

      const result = {
        client_id: accNo?.toString() || '',
        name: customer?.toString() || '',
        credit_limit: parseFloat(creditLimit) || 0,
        address: fullAddress,
        postal_code: postalCode,
        phone: phone?.toString() || '',
        contact_person: contact?.toString() || '',
        fax_number: faxNumber?.toString() || '',
        vat_number: vatNumber?.toString() || '',
        vat_registered: vatYN?.toString().toUpperCase() === 'Y',
        dormant_flag: dormantYN?.toString().toUpperCase() === 'Y',
        registration_number: regNumber?.toString() || '',
        registration_name: regName?.toString() || '',
        status: dormantYN?.toString().toUpperCase() === 'Y' ? 'Inactive' : 'Active'
      }
      
      // Debug first few processed records
      if (index < 3) {
        console.log(`Processed client ${index + 1}:`, {
          regNumber: regNumber?.toString(),
          regName: regName?.toString(),
          dormantYN: dormantYN?.toString(),
          dormant_flag: dormantYN?.toString().toUpperCase() === 'Y',
          status: dormantYN?.toString().toUpperCase() === 'Y' ? 'Inactive' : 'Active',
          totalColumns: row.length
        })
      }
      
      return result
    }).filter(client => client.name) // Only include rows with customer names

    console.log(`Processing ${clients.length} clients...`)

    // Insert in batches of 100
    const batchSize = 100
    for (let i = 0; i < clients.length; i += batchSize) {
      const batch = clients.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('clients')
        .insert(batch)

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
      } else {
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`)
      }
    }

    console.log('Import completed!')

  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Usage: node import-clients.js path/to/your/excel/file.xlsx
const excelFile = process.argv[2]
if (!excelFile) {
  console.log('Usage: node import-clients.js <path-to-excel-file>')
  process.exit(1)
}

importClients(excelFile)
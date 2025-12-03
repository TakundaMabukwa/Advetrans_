const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')

// Supabase configuration
const supabaseUrl = 'https://ihegfiqnobewpwcewrae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZWdmaXFub2Jld3B3Y2V3cmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzAzNjAsImV4cCI6MjA3NTg0NjM2MH0.xaxkB2Br7cQTQRD-PSheiKTY3Rg3jvqsA_pQn1JWS2I'
const supabase = createClient(supabaseUrl, supabaseKey)

async function importCustomers() {
  try {
    // Read Excel file
    const workbook = XLSX.readFile('cu.xlsx')
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // Skip header row
    const rows = data.slice(1)
    
    const customers = rows.map(row => ({
      account_number: row[0] || null,           // A: Acc No
      company: row[1] || null,                  // B: Customer
      credit_limit: row[2] || null,             // C: Credit Limit
      address_line_1: row[3] || null,           // D: Address line 1
      address_line_2: row[4] || null,           // E: Address line 2
      address_line_3: row[5] || null,           // F: Address line 3
      postal_line_1: row[8] || null,            // I: Postal line 1
      postal_line_2: row[9] || null,            // J: Postal line 2
      postal_line_3: row[10] || null,           // K: Postal line 3
      postal_line_4: row[11] || null,           // L: Postal line 4
      postal_line_5: row[12] || null,           // M: Postal line 5
      phone: row[13] || null,                   // N: Phone
      contact: row[14] || null,                 // O: Contact
      fax_number: row[15] || null,              // P: Fax number
      vat_number: row[16] || null,              // Q: Vat Number
      vat_status: row[17] || null,              // R: VAT(Y/N)
      dormant_status: row[18] || null,          // S: Dormant(Y/N)
      registration_number: row[19] || null,     // T: Registration Number
      legal_name: row[20] || null               // U: Registration Name
    }))

    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      const { error } = await supabase.from('customers').insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records)`)
      }
    }
    
    console.log('Import completed successfully!')
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

importCustomers()
const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://ihegfiqnobewpwcewrae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZWdmaXFub2Jld3B3Y2V3cmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzAzNjAsImV4cCI6MjA3NTg0NjM2MH0.xaxkB2Br7cQTQRD-PSheiKTY3Rg3jvqsA_pQn1JWS2I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function importStopPoints() {
  try {
    // Read Excel file - update this path to your Excel file location
    const filePath = './stop.xlsx' // Change this to your file path
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`Found ${data.length} rows to import`)
    
    // Helper function to get value with trimmed keys
    const getValue = (row, key) => {
      // Try exact match first
      if (row[key] !== undefined) return row[key]
      
      // Try trimmed keys
      const trimmedKey = Object.keys(row).find(k => k.trim() === key)
      return trimmedKey ? row[trimmedKey] : null
    }
    
    // Process each row
    const processedData = data.map(row => ({
      color: getValue(row, 'color') || null,
      outline: getValue(row, 'outline') || null,
      name: getValue(row, 'name') || null,
      style_url: getValue(row, 'style_url') || null,
      coordinates: getValue(row, 'coordinates') || null,
      name2: getValue(row, 'name2') || null,
      value: getValue(row, 'value') || null,
      radius: getValue(row, 'radius') ? parseFloat(getValue(row, 'radius')) : null,
      coordinates5: getValue(row, 'coordinates5') || null,
      coordinates6: getValue(row, 'coordinates6') || null
    }))
    
    // Insert data in batches of 100
    const batchSize = 100
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize)
      
      const { data: insertedData, error } = await supabase
        .from('stop_points')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
        errorCount += batch.length
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`)
        successCount += batch.length
      }
    }
    
    console.log('\n=== Import Summary ===')
    console.log(`Total rows processed: ${data.length}`)
    console.log(`Successfully imported: ${successCount}`)
    console.log(`Errors: ${errorCount}`)
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Run the import
importStopPoints()
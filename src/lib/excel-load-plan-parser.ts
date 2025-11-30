/**
 * Excel Load Plan Parser
 * Parses Excel files for load planning and validates customers against database
 */

import * as XLSX from 'xlsx'

export interface LoadPlanRow {
  customerID: string
  customerName: string
  weight: number
  drums?: number
  deliveryDate?: Date
  zone?: string
  address?: string
  latitude?: number
  longitude?: number
  [key: string]: any
}

export interface ParseResult {
  validRows: LoadPlanRow[]
  newCustomers: string[]
  errors: string[]
}

/**
 * Parse Excel file and validate customers
 */
export async function parseLoadPlanExcel(
  file: File | Buffer,
  existingCustomerIDs: Set<string>
): Promise<ParseResult> {
  const workbook = file instanceof Buffer 
    ? XLSX.read(file, { type: 'buffer' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' })
  
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
  
  const validRows: LoadPlanRow[] = []
  const newCustomers: string[] = []
  const errors: string[] = []
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue
    
    const customerID = String(row[0] || '').trim()
    
    if (!customerID) {
      errors.push(`Row ${i + 1}: Missing customer ID`)
      continue
    }
    
    // Check if customer exists
    if (!existingCustomerIDs.has(customerID)) {
      newCustomers.push(customerID)
    }
    
    validRows.push({
      customerID,
      customerName: String(row[1] || ''),
      weight: Number(row[2]) || 0,
      drums: row[3] ? Number(row[3]) : undefined,
      deliveryDate: row[4] ? parseExcelDate(row[4]) : undefined,
      zone: row[5] ? String(row[5]) : undefined,
      address: row[6] ? String(row[6]) : undefined,
      latitude: row[7] ? Number(row[7]) : undefined,
      longitude: row[8] ? Number(row[8]) : undefined
    })
  }
  
  return { validRows, newCustomers, errors }
}

/**
 * Parse Excel date format
 */
function parseExcelDate(value: any): Date | undefined {
  if (value instanceof Date) return value
  if (typeof value === 'number') {
    return XLSX.SSF.parse_date_code(value)
  }
  return undefined
}

/**
 * Fetch existing customer IDs from database
 */
export async function getExistingCustomerIDs(supabase: any): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('customers')
    .select('customer_id')
  
  if (error) throw error
  
  return new Set(data.map((row: any) => row.customer_id))
}

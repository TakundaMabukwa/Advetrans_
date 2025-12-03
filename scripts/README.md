# Client Import Script

This script imports client data from Excel files into your Supabase clients table.

## Setup

1. Navigate to the scripts directory:
```bash
cd scripts
```

2. Install dependencies:
```bash
npm install
```

## Usage

```bash
node import-clients.js path/to/your/excel/file.xlsx
```

## Excel Format Expected

The script expects these columns in order:
- A: Acc No
- B: Customer  
- C: Credit Limit
- D-F: Address (3 columns combined)
- G: Empty
- H-M: Postal (6 columns combined)
- N: Empty
- O: Phone
- P: Contact
- Q: Fax number
- R: Vat Number
- S: VAT(Y/N)
- T: Dormant(Y/N)
- U: Registration Number
- V: Registration Name

## Features

- Combines address columns (D-F) into single address field
- Combines postal columns (H-M) into single postal code
- Converts Y/N flags to boolean values
- Sets status based on dormant flag
- Processes data in batches of 100 records
- Skips empty rows
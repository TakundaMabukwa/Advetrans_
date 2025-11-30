# Customer Management System

## Overview

The customer management system ensures that all customers have proper location data, zone assignments, and delivery restrictions before orders can be assigned to vehicles.

## Database Schema

### `customers` Table

```sql
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  zone TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  restrictions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fields

- **customer_id**: Unique identifier from SAP/ERP system
- **customer_name**: Display name of the customer
- **zone**: Geographic zone (e.g., "Cape Town CBD", "Northern Suburbs")
- **address**: Full address with Mapbox geocoding
- **latitude/longitude**: Precise coordinates for routing
- **restrictions**: Array of delivery rules (e.g., "No deliveries after 4pm")

## Workflow

### 1. Excel Import

When importing orders from Excel:

1. System checks if customer exists in `customers` table
2. If customer exists:
   - Uses stored location, zone, and coordinates
   - No geocoding needed
3. If customer is new:
   - Flags order as `needs_customer_setup: true`
   - Prompts user to set up customer

### 2. New Customer Setup Modal

For each new customer, the user must:

1. **Assign Zone**: Select from predefined zones
2. **Confirm Address**: 
   - Type address in Mapbox-powered search
   - Select from suggestions
   - System captures precise coordinates
3. **Set Restrictions** (optional):
   - Add delivery rules
   - Examples: "No deliveries after 4pm", "Requires forklift", "Gate code: 1234"

### 3. Order Processing

Once all customers are set up:

- Orders inherit location data from customer records
- Vehicle assignment can proceed
- Route optimization uses accurate coordinates

## Benefits

### Efficiency
- **One-time setup**: Customer location entered once, reused forever
- **No repeated geocoding**: Faster order processing
- **Consistent data**: Same location used across all orders

### Accuracy
- **Verified addresses**: User confirms location via Mapbox
- **Precise coordinates**: Better route optimization
- **Zone-based planning**: Group orders by geographic area

### Compliance
- **Delivery restrictions**: Captured and enforced
- **Customer preferences**: Stored with customer record
- **Audit trail**: Track when customers were added/updated

## Usage

### Adding a New Customer (Manual)

```typescript
import { createCustomer } from '@/lib/utils/customer-utils'

const customer = await createCustomer({
  customer_id: '12345',
  customer_name: 'ABC Company',
  zone: 'Cape Town CBD',
  address: '123 Main St, Cape Town',
  latitude: -33.9249,
  longitude: 18.4241,
  restrictions: ['No deliveries after 4pm', 'Requires appointment']
})
```

### Checking for New Customers

```typescript
import { checkForNewCustomers } from '@/lib/utils/customer-utils'

const customerIds = ['12345', '67890']
const newCustomers = await checkForNewCustomers(customerIds)
// Returns customers that don't exist in database
```

### Getting Customer Data

```typescript
import { getCustomer } from '@/lib/utils/customer-utils'

const customer = await getCustomer('12345')
if (customer) {
  console.log(customer.zone, customer.address)
}
```

## Zones

Predefined zones for South Africa:

- Cape Town CBD
- Northern Suburbs
- Southern Suburbs
- Cape Flats
- West Coast
- Boland
- Garden Route
- Johannesburg
- Pretoria
- Durban
- Port Elizabeth
- Other

## Integration with pending_orders

The `pending_orders` table automatically populates location data from `customers`:

```sql
-- Trigger auto-populates location when customer_id is set
CREATE TRIGGER trigger_populate_order_location
  BEFORE INSERT OR UPDATE ON pending_orders
  FOR EACH ROW
  EXECUTE FUNCTION populate_order_location_from_customer();
```

## Future Enhancements

- [ ] Customer portal for self-service updates
- [ ] Bulk customer import from CSV
- [ ] Customer delivery history
- [ ] Preferred delivery time windows
- [ ] Multiple delivery addresses per customer
- [ ] Customer-specific pricing rules

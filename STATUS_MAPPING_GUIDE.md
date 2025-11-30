# Trip Status Mapping Guide

## Overview
The trip dashboard now displays user-friendly status labels on the frontend while maintaining the original backend status values in the database.

## Status Mapping

| Backend Status (Database) | Frontend Display Label |
|---------------------------|------------------------|
| `loading` | Loading |
| `unloading` | Unloading |
| `pending` | In queue |
| `leaving-depot` | Leaving depot |
| `on-trip` | En-route to delivery |
| `completed` | Completed |
| `delivered` | Completed |
| `fuelling` | Fuelling |
| `on-route-to-fuchs` | On-route to Fuchs |
| `back-at-depot` | Back at depot |
| `leaving-fuchs` | Leaving Fuchs |
| `service` | Service |
| `maintenance` | Maintenance |

## Files Modified

### 1. `/src/lib/utils/status-mapper.js` (NEW)
- Created utility functions to map between backend and frontend statuses
- `getDisplayStatus(backendStatus)` - converts backend status to frontend label
- `getBackendStatus(displayStatus)` - converts frontend label to backend status
- `FRONTEND_STATUS_OPTIONS` - array of all frontend status labels for dropdowns

### 2. `/src/hooks/use-badges.js`
- Updated `getTripStatusBadge()` function to use new status labels
- Added icons for all new statuses:
  - Package icon for Loading
  - PackageOpen icon for Unloading
  - Clock icon for In queue
  - Truck icon for Leaving depot
  - Play icon for En-route to delivery
  - CheckCircle icon for Completed
  - Fuel icon for Fuelling
  - MapPin icon for On-route to Fuchs
  - Home icon for Back at depot
  - Wrench icon for Service/Maintenance
- Added color coding for each status

### 3. `/src/components/forms/trip-form.jsx`
- Updated status dropdown to display frontend labels
- Automatically converts selected frontend label to backend status when saving
- Uses `FRONTEND_STATUS_OPTIONS` for dropdown options

### 4. `/src/components/detail-pages/trip-details.jsx`
- Simplified StatusBadge component to use centralized `getTripStatusBadge()` function
- Automatically displays frontend labels for all trip statuses

## How It Works

1. **Database Storage**: All trip statuses are stored in the database using the original backend values (e.g., `loading`, `on-trip`, `pending`)

2. **Frontend Display**: When displaying statuses to users, the `getDisplayStatus()` function automatically converts backend values to user-friendly labels

3. **Form Submission**: When users select a status from a dropdown, the `getBackendStatus()` function converts the frontend label back to the backend value before saving

4. **Backward Compatibility**: The system maintains full backward compatibility with existing data and database triggers

## Usage Examples

### Display a status badge
```javascript
import { getTripStatusBadge } from '@/hooks/use-badges'

// Automatically shows "En-route to delivery" for backend status "on-trip"
{getTripStatusBadge(trip.status)}
```

### Convert status for display
```javascript
import { getDisplayStatus } from '@/lib/utils/status-mapper'

const displayLabel = getDisplayStatus('on-trip') // Returns "En-route to delivery"
```

### Create a status dropdown
```javascript
import { FRONTEND_STATUS_OPTIONS, getBackendStatus } from '@/lib/utils/status-mapper'

<Select onValueChange={(label) => {
  const backendStatus = getBackendStatus(label)
  // Save backendStatus to database
}}>
  {FRONTEND_STATUS_OPTIONS.map((label) => (
    <SelectItem key={label} value={getBackendStatus(label)}>
      {label}
    </SelectItem>
  ))}
</Select>
```

## Database Triggers
The existing database triggers in `/supabase/migrations/20240101000000_audit_trigger.sql` continue to work with the backend status values:
- `loading` status triggers `time_accepted`
- `on-trip` status triggers `time_on_trip`
- `delivered` or `completed` status triggers `time_completed`

No changes to database triggers are required.

## Notes
- The "Multiple Clients" feature has been removed as requested
- All status changes are transparent to the backend
- The mapping is centralized in one file for easy maintenance
- New statuses can be added by updating the `STATUS_MAP` in `/src/lib/utils/status-mapper.js`

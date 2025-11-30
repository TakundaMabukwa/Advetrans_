# Driver Location & Route Map Integration

This guide shows how to add map functionality to your driver cards, allowing users to view driver locations and trip routes.

## Components Created

### 1. DriverLocationMap (`src/components/map/driver-location-map.tsx`)
- Displays driver location with a blue marker
- Shows trip route with origin (green), destination (red), and waypoints (orange)
- Uses Mapbox for mapping functionality
- Includes legend and loading states

### 2. DriverMapModal (`src/components/modals/driver-map-modal.tsx`)
- Modal popup that contains the map
- Fetches active trip data for the driver from Supabase
- Geocodes addresses to coordinates using Mapbox API
- Shows trip information and location details

### 3. DriverCardWithMap (`src/components/ui/driver-card-with-map.tsx`)
- Enhanced driver card component with map button
- Supports both performance and basic view modes
- Includes all standard driver card functionality plus map integration

## Quick Integration Steps

### Option 1: Use the New Driver Card Component

Replace your existing driver cards with the new `DriverCardWithMap` component:

```tsx
import DriverCardWithMap from '@/components/ui/driver-card-with-map'

// In your component
<DriverCardWithMap
  driver={{
    id: driver.id,
    driver_name: driver.name,
    plate: driver.plate,
    safety_score: driver.safety_score,
    efficiency: driver.efficiency,
    // ... other driver properties
  }}
  onView={handleViewDriver}
  onEdit={handleEditDriver}
  onDelete={handleDeleteDriver}
  showPerformanceMetrics={true}
/>
```

### Option 2: Add Map Button to Existing Cards

Add the map functionality to your existing driver cards:

```tsx
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import DriverMapModal from '@/components/modals/driver-map-modal'

function YourExistingDriverCard({ driver }) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  return (
    <div className="your-existing-card-classes">
      {/* Your existing card content */}
      
      {/* Add this map button */}
      <Button
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => setIsMapModalOpen(true)}
      >
        <MapPin className="w-3 h-3 mr-1" />
        Map
      </Button>

      {/* Add this modal */}
      <DriverMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        driver={driver}
      />
    </div>
  )
}
```

## Data Requirements

### Driver Object Structure
```tsx
interface Driver {
  id: string
  driver_name?: string  // or firstName + surname
  plate?: string        // Vehicle plate number
  currentLocation?: {   // Optional: real GPS coordinates
    lat: number
    lng: number
  }
  // ... other driver properties
}
```

### Trip Data Structure (from Supabase)
The system automatically fetches trip data based on the driver's vehicle plate. Ensure your trips table has:
- `vehicleAssignments` (JSON field with vehicle assignments)
- `pickupLocations` (JSON field with pickup addresses)
- `dropoffLocations` (JSON field with dropoff addresses)
- `waypoints` (JSON field with waypoint locations)
- `status` (trip status: pending, in-progress, etc.)

## Environment Setup

Ensure your `.env.local` has the Mapbox token:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Features

### Map Display
- **Blue Marker**: Driver's current location
- **Green Marker**: Trip origin
- **Red Marker**: Trip destination  
- **Orange Markers**: Waypoints along the route
- **Blue Line**: Route path connecting all points

### Automatic Features
- Geocoding of addresses to coordinates
- Trip data fetching from database
- Map bounds adjustment to show all points
- Loading states and error handling
- Responsive design

### Fallback Behavior
- If no GPS location available, uses default Johannesburg coordinates with random offset
- If no active trip found, shows driver location only
- Graceful error handling for geocoding failures

## Usage Examples

### Basic Usage
```tsx
// Simple driver card with map
<DriverCardWithMap
  driver={{ id: '1', driver_name: 'John Smith', plate: 'ABC123GP' }}
  onView={handleView}
/>
```

### Performance View
```tsx
// Driver card with performance metrics and map
<DriverCardWithMap
  driver={{
    id: '1',
    driver_name: 'John Smith',
    plate: 'ABC123GP',
    safety_score: 0.85,
    efficiency: 0.78,
    total_points: 92,
    reward_level: 'Gold'
  }}
  showPerformanceMetrics={true}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Custom Location
```tsx
// Driver with specific GPS coordinates
<DriverCardWithMap
  driver={{
    id: '1',
    driver_name: 'John Smith',
    plate: 'ABC123GP',
    currentLocation: { lat: -26.2041, lng: 28.0473 }
  }}
/>
```

## Testing

Use the example component to test the functionality:
```tsx
import DriverCardsWithMapExample from '@/components/examples/driver-cards-with-map-example'

// Add to your page for testing
<DriverCardsWithMapExample />
```

## Customization

### Styling
- Modify the map container classes in `DriverLocationMap`
- Customize modal size in `DriverMapModal`
- Adjust card styling in `DriverCardWithMap`

### Map Settings
- Change default location in `DriverLocationMap`
- Modify marker colors and styles
- Adjust zoom levels and bounds padding

### Data Sources
- Modify trip fetching logic in `DriverMapModal`
- Add additional location data sources
- Customize geocoding service (currently uses Mapbox)

This integration provides a complete solution for viewing driver locations and trip routes directly from your driver cards.
# Truck Route Optimization Setup Guide

## Overview
This implementation adds truck-specific route optimization to your Load Plan system, considering:
- Truck restrictions (bridges, weight limits, height restrictions)
- Real-time traffic conditions
- Optimal routing for commercial vehicles
- ETA calculations with truck profiles

## Database Setup

1. **Update Routes Table**
   Run the SQL script in `database/routes-schema.sql` to update your routes table:
   ```sql
   -- This will drop and recreate the routes table with enhanced fields
   -- Make sure to backup existing data first
   ```

## Environment Variables

Add to your `.env.local`:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Features Implemented

### 1. Route Optimization Service (`src/lib/route-optimization.ts`)
- Uses Mapbox Directions API with truck profile
- Considers truck dimensions and weight restrictions
- Avoids roads unsuitable for trucks
- Provides real-time traffic-aware routing

### 2. Route API Endpoint (`src/app/api/routes/route.ts`)
- POST: Create optimized route
- GET: Retrieve routes by order ID
- Stores route data in enhanced database schema

### 3. UI Components

#### RouteOptimizer (`src/components/ui/route-optimizer.tsx`)
- Integrated into Load Plan creation
- Shows distance, duration, and ETA
- Displays truck restrictions and warnings
- Auto-triggers when loading and drop-off locations are set

#### RouteTracker (`src/components/ui/route-tracker.tsx`)
- Real-time route tracking
- Status monitoring (planned, active, completed)
- Displays truck-specific warnings and restrictions

### 4. Load Plan Integration
The route optimizer is automatically triggered when:
- Loading Location is set
- Drop Off Location is set
- Both locations are valid

## Usage

### Creating a Load with Route Optimization

1. Go to Load Plan → Create Load
2. Fill in basic load information
3. Set Loading Location and Drop Off Location
4. Route optimization will automatically appear
5. Click "Optimize Truck Route" to generate the best route
6. Route data is saved and linked to the load

### Viewing Route Progress

1. Go to Load Plan → Routing tab
2. View all loads with their optimized routes
3. Track route status and progress
4. See truck restrictions and traffic warnings

## Truck Profile Configuration

The system uses these truck specifications:
- Max Weight: 40 tons
- Max Height: 4.2m
- Max Width: 2.5m  
- Max Length: 18.75m

These can be adjusted in `src/lib/route-optimization.ts`.

## API Usage

### Create Route
```javascript
POST /api/routes
{
  "origin": "Johannesburg, South Africa",
  "destination": "Cape Town, South Africa", 
  "vehicleId": "vehicle_123",
  "orderId": "ORD-12345"
}
```

### Get Routes
```javascript
GET /api/routes?orderId=ORD-12345
```

## Benefits

1. **Truck-Specific Routing**: Avoids bridges, roads with weight/height restrictions
2. **Traffic Optimization**: Real-time traffic consideration for accurate ETAs
3. **Cost Efficiency**: Optimized routes reduce fuel costs and delivery times
4. **Compliance**: Ensures trucks follow legal routes and restrictions
5. **Real-time Tracking**: Monitor route progress and status

## Next Steps

1. Run the database migration
2. Add your Mapbox token to environment variables
3. Test route optimization with sample loads
4. Monitor route performance and adjust truck parameters as needed

## Troubleshooting

- **No routes found**: Check Mapbox token and location validity
- **Truck restrictions**: Review truck dimensions in route-optimization.ts
- **Database errors**: Ensure routes table schema is updated
- **API errors**: Check server logs for detailed error messages
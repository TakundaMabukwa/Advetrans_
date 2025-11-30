# Quick Route Optimization Setup

## How It Works

The route optimization system:

1. **Triggers automatically** when you set both Loading Location and Drop Off Location in Load Plan → Create Load
2. **Uses Mapbox Directions API** with truck profile for commercial vehicle routing
3. **Shows live preview** with interactive map displaying the route
4. **Considers truck restrictions** like bridge heights, weight limits, road restrictions
5. **Provides real-time traffic** for accurate ETAs

## Setup Steps

### 1. Database Update
Run this SQL in your Supabase dashboard:

```sql
-- Update routes table
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS route_data jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS vehicle_id text;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS distance_km numeric;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS estimated_eta timestamp with time zone;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS truck_restrictions jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS traffic_warnings jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS route_geometry jsonb;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS status text DEFAULT 'planned';
```

### 2. Environment Variable
Add to your `.env.local`:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

Get a free token at: https://account.mapbox.com/access-tokens/

## Usage

### Creating Load with Route Preview

1. Go to **Load Plan → Create Load**
2. Fill in basic details (Client, Commodity, etc.)
3. Set **Loading Location** and **Drop Off Location**
4. **Route preview map appears automatically** showing:
   - Green marker: Loading location
   - Red marker: Drop-off location  
   - Blue line: Optimized route
5. Click **"Optimize Truck Route"** for detailed analysis
6. View distance, duration, ETA, and any truck restrictions

### Viewing Route Progress

1. Go to **Load Plan → Routing** tab
2. See all loads with their optimized routes
3. Track route status and progress
4. View truck restrictions and traffic warnings

## Features

- **Live Map Preview**: See route before creating load
- **Truck-Specific Routing**: Avoids restricted roads/bridges
- **Traffic-Aware ETAs**: Real-time traffic consideration
- **Restriction Warnings**: Shows weight/height/bridge limitations
- **Route Tracking**: Monitor progress from planned to completed

The system automatically optimizes for 40-ton trucks with standard commercial vehicle dimensions.
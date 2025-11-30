import { NextRequest, NextResponse } from 'next/server';
import { TruckRouteOptimizer } from '@/lib/route-optimization';

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, pickupTime, waypoints } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    const optimizer = new TruckRouteOptimizer();
    const routeData = await optimizer.optimizeRoute({
      origin,
      destination,
      profile: 'truck',
      departureTime: pickupTime,
      waypoints: waypoints || []
    });

    // Return route data without saving to database
    return NextResponse.json({
      success: true,
      route: {
        distance: routeData.distance,
        duration: routeData.duration,
        eta: routeData.eta,
        geometry: routeData.geometry,
        warnings: routeData.warnings,
        restrictions: routeData.restrictions,
        tollgates: routeData.tollgates,
        provinces: routeData.provinces,
        breakTime: routeData.breakTime,
        totalDurationWithBreaks: routeData.totalDurationWithBreaks
      }
    });

  } catch (error) {
    console.error('Route preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
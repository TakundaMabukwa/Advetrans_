import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { origin, destination, vehicleId, orderId, pickupTime, waypoints, routeGeometry, distance, duration } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    // For now, just return success without saving to database
    // The route data will be stored in the trips table instead
    return NextResponse.json({
      success: true,
      route: {
        id: orderId,
        order_number: orderId,
        distance: distance || 0,
        duration: duration || 0,
        geometry: routeGeometry
      }
    });

  } catch (error) {
    console.error('Route API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    const supabase = await createClient();
    let query = supabase.from('routes').select('*');
    
    if (orderId) {
      query = query.eq('order_number', orderId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
    }

    return NextResponse.json({ routes: data });

  } catch (error) {
    console.error('Route fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
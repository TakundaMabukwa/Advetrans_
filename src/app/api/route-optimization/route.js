import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findClosestVehicle } from '@/lib/route-optimization'

export async function POST(request) {
  try {
    const { targetLocation } = await request.json()
    
    if (!targetLocation?.latitude || !targetLocation?.longitude) {
      return NextResponse.json({ error: 'Target location required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: highRiskAreas } = await supabase.from('high_risk').select('*')
    
    const closestVehicle = await findClosestVehicle(targetLocation, highRiskAreas || [])
    
    if (!closestVehicle) {
      return NextResponse.json({ error: 'No vehicles available' }, { status: 404 })
    }
    
    return NextResponse.json({
      vehicle: closestVehicle,
      avoidedHighRiskAreas: closestVehicle.passesHighRisk,
      checkedAreas: highRiskAreas?.length || 0
    })
    
  } catch (error) {
    console.error('Route optimization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
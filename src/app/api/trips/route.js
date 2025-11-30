import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client

// Helper function to verify auth
async function verifyAuth(request) {

  const supabase = createClient();

  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error) return null
  
  // Get client ID from user metadata
  const { data: userData } = await supabase
    .from('users')
    .select('client_id')
    .eq('id', data.user.id)
    .single()
  
  return { ...data.user, clientId: userData?.client_id }
}

// *****************************
// get trips
// *****************************
export async function GET(request) {
  const token = await verifyAuth(request)

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }
  
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('client_id', token.clientId)
    
    if (error) throw error
    
    return NextResponse.json(trips)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add trip
// *****************************
export async function POST(request) {
  const token = await verifyAuth(request)

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const clientId = token.clientId
    
    // Look up cost centre ID by name
    const { data: costCentres, error: costCentreError } = await supabase
      .from('cost_centres')
      .select('id, active_trips')
      .eq('client_id', clientId)
      .eq('name', body.costCentre)
      .limit(1)
    
    if (costCentreError) throw costCentreError
    
    if (!costCentres || costCentres.length === 0) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }
    
    const costCentreId = costCentres[0].id
    
    // Get last used trip ID
    const { data: lastTrips, error: lastTripError } = await supabase
      .from('trips')
      .select('id')
      .eq('client_id', clientId)
      .order('id', { ascending: false })
      .limit(1)
    
    if (lastTripError) throw lastTripError
    
    let lastIdNum = 0
    if (lastTrips && lastTrips.length > 0) {
      const lastId = lastTrips[0].id
      lastIdNum = parseInt(lastId.split('-')[1]) || 0
    }
    
    const newId = `TRP-${String(lastIdNum + 1).padStart(3, '0')}`
    
    // Create the trip
    const newTrip = {
      ...body,
      client_id: clientId,
      cost_centre_id: costCentreId,
      id: newId,
      status: body.status || 'active',
      created_at: new Date().toISOString().split('T')[0],
    }
    
    const { data: insertedTrip, error: insertError } = await supabase
      .from('trips')
      .insert(newTrip)
      .select()
      .single()
    
    if (insertError) throw insertError
    
    // Update cost centre's activeTrips count
    if (body.status === 'completed' || body.status === 'cancelled') {
      await supabase
        .from('cost_centres')
        .update({ active_trips: costCentres[0].active_trips + 1 })
        .eq('id', costCentreId)
    }
    
    // Update vehicles and drivers status
    const vehicles = body.vehicleAssignments.map(v => v.vehicle)
    const drivers = body.vehicleAssignments.flatMap(v => v.drivers)
    
    const statusForEntities = ['completed', 'cancelled'].includes(body.status)
      ? 'available'
      : 'on-trip'
    const tripIdForDriver = body.status === 'completed' ? null : body.id
    
    // Update vehicles status
    for (const v of vehicles) {
      await supabase
        .from('vehicles')
        .update({
          status: statusForEntities,
          assigned_to: body.clientDetails.name
        })
        .eq('client_id', clientId)
        .eq('id', v.id)
    }
    
    // Update drivers status
    for (const d of drivers) {
      await supabase
        .from('drivers')
        .update({
          status: statusForEntities,
          current_trip: tripIdForDriver
        })
        .eq('client_id', clientId)
        .eq('id', d.id)
    }
    
    return NextResponse.json(insertedTrip, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

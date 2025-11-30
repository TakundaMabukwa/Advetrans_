import { NextResponse } from 'next/server'
import { getUserScopedVehicles } from '@/utils/vehicles'
import { supabase } from '@/lib/supabase-client'

// Helper to get user from Supabase session
async function getUser(request) {
  const { data, error } = await supabase.auth.getUser(
    request.headers.get('Authorization')?.replace('Bearer ', '')
  )
  if (error || !data?.user) return null
  return data.user
}

// *****************************
// get vehicles
// *****************************
export async function GET(request) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const vehicles = await getUserScopedVehicles(user)
    return NextResponse.json(vehicles)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add vehicle
// *****************************
export async function POST(request) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const clientId = user.id

    // Lookup costCentreId by name
    const { data: costCentres, error: costCentreError } = await supabase
      .from('breakdown_cost_centres')
      .select('*')
      // .eq('client_id', clientId)
      // .eq('name', body.costCentre)
      .limit(1)
      .maybeSingle()

    if (costCentreError || !costCentres) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    const costCentreId = costCentres.id

    // Get last used vehicle ID
    const { data: lastVehicle, error: lastVehicleError } = await supabase
      .from('vehiclesc')
      .select('id')
      // .eq('client_id', clientId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()

    let lastIdNum = 0
    if (lastVehicle && lastVehicle.id) {
      lastIdNum = parseInt(lastVehicle.id.split('-')[1]) || 0
    }

    const newId = `VEH-${String(lastIdNum + 1).padStart(3, '0')}`

    // Create the vehicle object
    const newVehicle = {
      ...body,
      client_id: clientId,
      cost_centre_id: costCentreId,
      id: newId,
      status: body.status || 'active',
      created_at: new Date().toISOString().split('T')[0],
    }

    const { data: insertedVehicle, error: insertError } = await supabase
      .from('vehiclesc')
      .insert([newVehicle])
      .select()
      .maybeSingle()

    if (insertError) {
      throw insertError
    }

    // Increment vehicle count on cost centre
    await supabase
      .from('cost_centres')
      .update({ vehicles: (costCentres.vehicles || 0) + 1 })
      .eq('id', costCentreId)

    return NextResponse.json({ ...insertedVehicle }, { status: 201 })
  } catch (error) {
    console.error('Error adding vehicle:', error)

    let errorMessage = 'Server error'
    if (error?.code === '23505') {
      errorMessage = 'A vehicle with that ID already exists.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logUserActivity } from '@/utils/logUserActivity'

// Helper to get user from Supabase Auth
async function getUser(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split('Bearer ')[1]
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  // You may want to fetch additional user info from your DB if needed
  // For now, just return the user object
  return user
}

// *****************************
// update cost centre
// *****************************
export async function PUT(request, { params }) {
  const user = await getUser(request)
  const { id } = params
  const body = await request.json()

  if (!user || !user.id || !user.user_metadata?.clientId) {
    return NextResponse.json(
      { error: 'Not authorized or missing clientId' },
      { status: 401 }
    )
  }

  if (!id) {
    return NextResponse.json(
      { error: 'Missing cost centre ID' },
      { status: 400 }
    )
  }

  try {
    // Step 1: Query cost centre by ID field
    const { data: costCentre, error: fetchError } = await supabase
      .from('cost_centres')
      .select('*')
      .eq('id', id)
      .eq('client_id', user.user_metadata.clientId)
      .single()

    if (fetchError || !costCentre) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    // Step 2: Merge existing data with new data
    const updatedData = { ...costCentre, ...body }

    // Step 3: Update document in Supabase
    const { error: updateError } = await supabase
      .from('cost_centres')
      .update(updatedData)
      .eq('id', id)
      .eq('client_id', user.user_metadata.clientId)

    if (updateError) {
      throw updateError
    }

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    await logUserActivity(supabase, user, {
      timestamp: new Date().toISOString(),
      activity: 'Updated Cost Centre',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json({ id, ...updatedData }, { status: 200 })
  } catch (error) {
    console.error('Error updating cost centre:', error)
    return NextResponse.json(
      { error: 'Failed to update cost centre' },
      { status: 500 }
    )
  }
}

// *****************************
// delete cost centre
// *****************************
export async function DELETE(request, { params }) {
  const user = await getUser(request)
  const { id } = params

  if (!user || !user.id || !user.user_metadata?.clientId) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json(
      { error: 'Missing cost centre ID' },
      { status: 400 }
    )
  }

  try {
    const { data: costCentre, error: fetchError } = await supabase
      .from('cost_centres')
      .select('*')
      .eq('id', id)
      .eq('client_id', user.user_metadata.clientId)
      .single()

    if (fetchError || !costCentre) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    if (user.user_metadata.costCentreId == costCentre.costCentreId) {
      return NextResponse.json(
        { error: 'Main cost centre can not be deleted' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('cost_centres')
      .delete()
      .eq('id', id)
      .eq('client_id', user.user_metadata.clientId)

    if (deleteError) {
      throw deleteError
    }

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    await logUserActivity(supabase, user, {
      timestamp: new Date().toISOString(),
      activity: 'Deleted Cost Centre',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase'
import { logUserActivity } from '@/utils/logUserActivity'

// *****************************
// update driver
// *****************************
export async function PUT(request, { params }) {
  const supabase = createClient()
  const { id } = params
  const body = await request.json()

  // Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json(
      { error: 'You are not authorized' },
      { status: 401 }
    )
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    // Find driver by id and user company (assuming user.app_metadata.company_id)
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .eq('company_id', user.app_metadata?.company_id)
      .single()

    if (driverError || !driver) {
      return NextResponse.json(
        { error: `Driver with id: ${id} was not found` },
        { status: 404 }
      )
    }

    // Update driver
    const { data: updatedDriver, error: updateError } = await supabase
      .from('drivers')
      .update(body)
      .eq('id', id)
      .eq('company_id', user.app_metadata?.company_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update driver with id: ${id}` },
        { status: 500 }
      )
    }

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    await logUserActivity(supabase, user, {
      timestamp: new Date().toISOString(),
      activity: 'Updated Driver',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json({ id, ...updatedDriver }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update driver with id: ${id}` },
      { status: 500 }
    )
  }
}

// *****************************
// delete driver
// *****************************
export async function DELETE(request, { params }) {
  const supabase = createClient()
  const { id } = params

  // Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    // Find driver by id and user company
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id')
      .eq('id', id)
      .eq('company_id', user.app_metadata?.company_id)
      .single()

    if (driverError || !driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    // Delete driver
    const { error: deleteError } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)
      .eq('company_id', user.app_metadata?.company_id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Something went wrong...' },
        { status: 500 }
      )
    }

    // update recentActivities
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    await logUserActivity(supabase, user, {
      timestamp: new Date().toISOString(),
      activity: 'Deleted Driver',
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

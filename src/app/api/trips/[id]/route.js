import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

const supabase = createRouteHandlerClient()

// *****************************
// update trip
// *****************************
export async function PUT(request, { params }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = params
  const body = await request.json()

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 })
  }

  try {
    // Get trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      // .eq('client_id', user.id)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Update trip
    const { error: updateError } = await supabase
      .from('trips')
      .update(body)
      .eq('id', id)
    // .eq('client_id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ id, ...body }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

// *****************************
// delete trip
// *****************************
export async function DELETE(request, { params }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = params

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }
  if (!id) {
    return NextResponse.json({ error: 'Missing trip ID' }, { status: 400 })
  }

  try {
    // Delete trip
    await supabase
      .from('trips')
      .delete()
      .eq('id', id)
    // .eq('client_id', user.id)

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}

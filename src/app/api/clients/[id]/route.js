import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// *****************************
// update client
// *****************************
export async function PUT(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const { id } = params
  const body = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing client ID' }, { status: 400 })

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
    if (profileError || !profile?.client_id) {
      return NextResponse.json({ error: 'Missing company ID' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', id)
      .eq('company', profile.client_id)
      .select()
      .single()
    if (error) throw error

    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      activity: 'Updated Client',
      ip: ip === '::1' ? 'localhost' : ip,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

// *****************************
// delete client
// *****************************
export async function DELETE(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing client ID' }, { status: 400 })

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
    if (profileError || !profile?.client_id) {
      return NextResponse.json({ error: 'Missing company ID' }, { status: 401 })
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('company', profile.client_id)
    if (error) throw error

    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      activity: 'Deleted Client',
      ip: ip === '::1' ? 'localhost' : ip,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong...' }, { status: 500 })
  }
}

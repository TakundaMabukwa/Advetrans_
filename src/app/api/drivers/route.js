import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAuth } from '@/utils/verify-auth'
import { logUserActivity } from '@/utils/logUserActivity'

// GET: List drivers for authenticated user
export async function GET(request) {
  const token = await verifyAuth(request)
  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('client_id', token.clientId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST: Add a new driver
export async function POST(request) {
  const token = await verifyAuth(request)
  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Find cost centre by name
    const { data: costCentre, error: ccError } = await supabase
      .from('cost_centres')
      .select('id')
      .eq('name', body.costCentre)
      .eq('client_id', token.clientId)
      .single()

    if (ccError || !costCentre) {
      return NextResponse.json({ error: 'Cost centre not found' }, { status: 404 })
    }

    // Get last driver id for this client
    const { data: lastDriver } = await supabase
      .from('drivers')
      .select('id')
      .eq('client_id', token.clientId)
      .order('id', { ascending: false })
      .limit(1)
      .single()

    let lastIdNum = 0
    if (lastDriver && lastDriver.id) {
      const match = lastDriver.id.match(/DRV-(\d+)/)
      lastIdNum = match ? parseInt(match[1]) : 0
    }
    const newId = `DRV-${String(lastIdNum + 1).padStart(3, '0')}`

    // Insert new driver
    const { data: newDriver, error: insertError } = await supabase
      .from('drivers')
      .insert([{
        ...body,
        id: newId,
        client_id: token.clientId,
        cost_centre_id: costCentre.id,
        status: body.status || 'active',
        created_at: new Date().toISOString().split('T')[0],
      }])
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Optionally: increment driver count on cost centre (if you store it)
    // await supabase.rpc('increment_driver_count', { cost_centre_id: costCentre.id })

    // Log activity
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'
    await logUserActivity(supabase, token, {
      timestamp: new Date().toISOString(),
      activity: 'Added Driver',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(newDriver, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

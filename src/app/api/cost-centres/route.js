import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

async function getUserFromRequest(request) {
  const supabase = getSupabaseClient()
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token || !supabase) return { user: null, error: 'Missing token or supabase client' }
  const { data, error } = await supabase.auth.getUser(token)
  return { user: data?.user, error }
}

async function getCompanyId(user) {
  if (user?.user_metadata?.company_id) return user.user_metadata.company_id
  if (user?.user_metadata?.clientId) return user.user_metadata.clientId

  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data?.company_id ?? null
}

// *****************************
// get cost centres
// *****************************
export async function GET(request) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const { user, error: authError } = await getUserFromRequest(request)

  if (authError || !user) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  const companyId = await getCompanyId(user)
  if (!companyId) {
    return NextResponse.json({ error: 'missing company id' }, { status: 400 })
  }

  const { data: costCentres, error } = await supabase
    .from('cost_centres')
    .select('*')
    // .eq('company', companyId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(costCentres)
}

// *****************************
// add cost centres
// *****************************
export async function POST(request) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const { user, error: authError } = await getUserFromRequest(request)

  if (authError || !user) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  const companyId = await getCompanyId(user)
  if (!companyId) {
    return NextResponse.json({ error: 'missing company id' }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Check for duplicates by name within the same company
    const { data: existing, error: dupErr } = await supabase
      .from('cost_centres')
      .select('id')
      .eq('company', companyId)
      .eq('name', body.name)
      .limit(1)
    if (dupErr) {
      return NextResponse.json({ error: dupErr.message }, { status: 500 })
    }
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { message: 'Cost centre already exists' },
        { status: 409 }
      )
    }

    // Get last used business ID like CC-001
    const { data: lastRows, error: lastErr } = await supabase
      .from('cost_centres')
      .select('id')
      .eq('company', companyId)
      .order('id', { ascending: false })
      .limit(1)
    if (lastErr) {
      return NextResponse.json({ error: lastErr.message }, { status: 500 })
    }

    let lastIdNum = 0
    if (lastRows && lastRows.length > 0) {
      const lastId = lastRows[0].id
      lastIdNum = parseInt(String(lastId).split('-')[1], 10) || 0
    }
    const newId = `CC-${String(lastIdNum + 1).padStart(3, '0')}`

    const newCostCentre = {
      ...body,
      company: companyId,
      id: newId,
      status: body.status || 'active',
      users: 0,
      vehicles: 0,
      activeTrips: 0,
      createdAt: body.established || new Date().toISOString().split('T')[0],
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('cost_centres')
      .insert(newCostCentre)
      .select('*')
      .single()

    if (insertErr) {
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      )
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Best-effort logging; ignore failures
    await supabase.from('recent_activities').insert({
      user_id: user.id,
      company_id: companyId,
      timestamp: new Date().toISOString(),
      activity: 'Added Cost Centre',
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(inserted, { status: 201 })
  } catch (error) {
    console.error('Error adding cost centre:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

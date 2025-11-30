import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// *****************************
// get clients
// *****************************
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verify authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  
  if (authError || !session) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }
  
  try {
    // Get user's company/organization info
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
      
    if (profileError) throw profileError
    
    // Get all clients for this company
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company', userProfile.client_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(clients)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add clients
// *****************************
export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Verify authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  
  if (authError || !session) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Get user's company info
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
      
    if (profileError) throw profileError
    const clientId = userProfile.client_id
    
    // Check for duplicates by name
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', body.name)
      .eq('company', clientId)
      .maybeSingle()
      
    if (checkError) throw checkError
    
    if (existingClient) {
      return NextResponse.json(
        { message: 'client already exists' },
        { status: 409 }
      )
    }

    // Get last used ID
    const { data: lastClient, error: lastIdError } = await supabase
      .from('clients')
      .select('id')
      .eq('company', clientId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    if (lastIdError) throw lastIdError
    
    let lastIdNum = 0
    if (lastClient) {
      const lastId = lastClient.id
      lastIdNum = parseInt(lastId.split('-')[1]) || 0
    }

    const newId = `CL-${String(lastIdNum + 1).padStart(3, '0')}`

    // Prepare new client
    const newClient = {
      ...body,
      company: clientId,
      id: newId,
      status: body.status || 'active',
      users: 0,
      vehicles: 0,
      active_trips: 0,
      created_at: body.established || new Date().toISOString().split('T')[0],
    }

    // Insert the new client
    const { data, error: insertError } = await supabase
      .from('clients')
      .insert(newClient)
      .select()
      .single()
      
    if (insertError) throw insertError

    // Log user activity
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
               
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      activity: 'Added Client',
      timestamp: new Date().toISOString(),
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding client:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// *****************************
// get all data for trip form
// *****************************
export async function GET() {
  const supabase = createClient({ cookies })
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
    if (profileError) throw profileError
    const clientId = profile.client_id

    const safeList = async (table, select = '*') => {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('company', clientId)
      return error ? [] : data
    }

    const [vehicles, cost_centres, drivers, clients, routes] = await Promise.all([
      safeList('vehicles', '*'),
      safeList('cost_centres', '*'),
      safeList('drivers', '*'),
      safeList('clients', 'id,name'),
      safeList('routes', '*'),
    ])

    return NextResponse.json({ vehicles, cost_centres, drivers, clients, routes }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

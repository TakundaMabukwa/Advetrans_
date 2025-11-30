import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: NextRequest) {
  try {
    const { driverIds, available } = await request.json()
    
    if (!Array.isArray(driverIds) || driverIds.length === 0) {
      return NextResponse.json({ error: 'Driver IDs are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await supabase
      .from('drivers')
      .update({ available })
      .in('id', driverIds)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      drivers: data 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
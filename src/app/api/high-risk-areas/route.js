import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('high_risk')
      .select('*')
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('High-risk areas fetched:', data?.length || 0)
    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('high_risk')
      .insert(body)
      .select()
    
    if (error) {
      console.error('Error creating high-risk area:', error)
      return NextResponse.json(
        { error: 'Failed to create high-risk area' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data: data[0] })
  } catch (error) {
    console.error('Error in high-risk areas POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
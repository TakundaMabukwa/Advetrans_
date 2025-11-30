import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Call the scheduling function
    const { data, error } = await supabase
      .rpc('schedule_unassigned_orders')
    
    if (error) {
      console.error('Error carrying over orders:', error)
      return NextResponse.json({ error: 'Failed to carry over orders' }, { status: 500 })
    }
    
    const result = data?.[0] || { carried_over_count: 0, message: 'No orders to carry over' }
    
    return NextResponse.json({
      success: true,
      scheduledCount: result.scheduled_count,
      message: result.message
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get prioritized orders for today
    const { data, error } = await supabase
      .rpc('get_prioritized_orders_for_date')
    
    if (error) {
      console.error('Error fetching prioritized orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      orders: data || []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
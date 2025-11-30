import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// *****************************
// update vehicle
// *****************************
export async function PUT(request, { params }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing vehicle ID' }, { status: 400 })

  const body = await request.json()
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data, error } = await supabase
      .from('vehiclesc')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update vehicle with id: ${id}` },
      { status: 500 }
    )
  }
}

// *****************************
// delete vehicle
// *****************************
export async function DELETE(request, { params }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing vehicle ID' }, { status: 400 })

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { error } = await supabase
      .from('vehiclesc')
      .delete()
      .eq('id', id)
    if (error) throw error

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}

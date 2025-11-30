import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// *****************************
// update vehicle
// *****************************
export async function PUT(request, { params }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing vehicle ID' }, { status: 400 })

  const body = await request.json()
  try {
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

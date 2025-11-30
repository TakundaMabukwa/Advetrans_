import { NextResponse } from 'next/server'
// import * as dummy from '../../../../../dummy-data'
import { verifyAuth } from '@/utils/verify-auth'
import { auth, db } from '@/lib/server-db'

// Mock database
// let stopPoints = dummy.stop_points_data

// *****************************
// fetch stop point
// *****************************
// export async function GET(request, { params }) {
//   const { pageId, id } = await params
//   let stopPoint = []

//   stopPoint = stopPoints.find((sp) => sp.id === id)
//   // communicate with database
//   return NextResponse.json(stopPoint)
// }

// *****************************
// update stop point
// *****************************
export async function PUT(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params
  const body = await request.json()

  if (!token || !token.clientId) {
    return NextResponse.json(
      { error: 'You are not authorized' },
      { status: 401 }
    )
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    // Step 1: Query stop points by ID field
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/stopPoints`)
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: `Stop point with id: ${id} was not found` },
        { status: 404 }
      )
    }

    const doc = querySnapshot.docs[0]
    const docRef = doc.ref

    // Step 2: Merge existing data with new data
    const updatedData = { ...doc.data(), ...body }

    // Step 3: Update document in Firestore
    await docRef.set(updatedData)

    return NextResponse.json({ id, ...updatedData }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update stop point with id: ${id}` },
      { status: 500 }
    )
  }
}

// *****************************
// delete stop points
// *****************************
export async function DELETE(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params

  if (!token && !token.clientId) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json(
      { error: 'MIssing stop point ID' },
      { status: 400 }
    )
  }
  try {
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/stopPoints`)
      .where('id', '==', id)
      .limit(1) // Optional: safety for unique IDs
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: `Stop point with id: ${id} was not found` },
        { status: 404 }
      )
    }

    const doc = querySnapshot.docs[0]

    await doc.ref.delete()

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}

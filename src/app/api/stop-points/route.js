import { NextResponse } from 'next/server'
// import * as dummy from '../../../../dummy-data'
import { verifyAuth } from '@/utils/verify-auth'
import { auth, db } from '@/lib/server-db'

// *****************************
// fetch stop points
// *****************************
export async function GET(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }

  try {
    const clientId = token.clientId
    const stopPointsRef = db.collection(`companies/${clientId}/stopPoints`)
    const allSnapshot = await stopPointsRef.get()
    const stop_points = allSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return NextResponse.json(stop_points)
  } catch (err) {
    // console.log({ error: err.message })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add stop point
// *****************************
export async function POST(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const clientId = token.clientId

    // Firestore references
    const stopPointsRef = db.collection(`companies/${clientId}/stopPoints`)
    const costCentresRef = db.collection(`companies/${clientId}/costCentres`)

    // Get last used vehicle ID
    const lastSnap = await stopPointsRef.orderBy('id', 'desc').limit(1).get()

    let lastIdNum = 0
    if (!lastSnap.empty) {
      const lastId = lastSnap.docs[0].data().id
      lastIdNum = parseInt(lastId.split('-')[1]) || 0
    }

    const newId = `STP-${String(lastIdNum + 1).padStart(3, '0')}`

    // Create the vehicle object
    const newStopPoint = {
      ...body,
      clientId,
      // costCentreId,
      id: newId,
      status: body.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const docRef = await stopPointsRef.add(newStopPoint)
    await stopPointsRef.doc(docRef.id).update({ uid: docRef.id })
    return NextResponse.json(
      { id: docRef.id, ...newStopPoint },
      { status: 201 }
    )
  } catch (error) {
    const firebaseError = error?.errorInfo?.code || error.code || ''
    let errorMessage = firebaseError

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

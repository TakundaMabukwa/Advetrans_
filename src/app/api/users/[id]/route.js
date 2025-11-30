// import * as dummy from '../../../../../dummy-data'

// next
import { NextResponse } from 'next/server'

import { verifyAuth } from '@/utils/verify-auth'
import { auth, db } from '@/lib/server-db'

// Mock database
// let users = dummy.users_data

// *****************************
// get user
// *****************************
// export async function GET(request, { params }) {
//   const token = await verifyAuth(auth, db, request, 'verifyIdToken')
//   const { id } = await params
//   const user = users.find((u) => u.id === id)

//   if (!user) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 })
//   }

//   return NextResponse.json(user)
// }

// *****************************
// update user
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
    // Step 1: Query cost centre by ID field
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/users`)
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: `User with id: ${id} was not found` },
        { status: 404 }
      )
    }

    const doc = querySnapshot.docs[0]
    const docRef = doc.ref

    // Step 2: Merge existing data with new data
    const updatedData = { ...doc.data(), ...body }

    // Step 3: Update document in Firestore
    await docRef.set(
      updatedData
      //  { merge: true }
    )

    return NextResponse.json({ id, ...updatedData }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update user with id: ${id}` },
      { status: 500 }
    )
  }
}

// *****************************
// delete user
// *****************************
export async function DELETE(request, { params }) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')
  const { id } = await params

  if (!token && !token.clientId) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  try {
    const querySnapshot = await db
      .collection(`companies/${token.clientId}/users`)
      .where('id', '==', id)
      .limit(1) // Optional: safety for unique IDs
      .get()

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Cost user found' }, { status: 404 })
    }

    const doc = querySnapshot.docs[0]
    if (token.uid == doc.uid) {
      return NextResponse.json(
        { error: 'Super admin can not be deleted' },
        { status: 400 }
      )
    }
    await doc.ref.delete()

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}

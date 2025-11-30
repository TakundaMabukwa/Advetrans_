import { NextResponse } from 'next/server'
// import { users_data } from '../../../../dummy-data'
import { auth, db } from '@/lib/server-db'
import { verifyAuth } from '@/utils/verify-auth'
import { getUserScopedUsers } from '@/utils/users'

// Mock database
// const users = users_data

// *****************************
// get users
// *****************************
export async function GET(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 500 })
  }

  try {
    const costCentres = await getUserScopedUsers(token)
    return NextResponse.json(costCentres)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// *****************************
// add users
// *****************************
export async function POST(request) {
  const token = await verifyAuth(auth, db, request, 'verifyIdToken')

  if (!token) {
    return NextResponse.json({ error: 'not a valid user' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const clientId = token.clientId

    // get database collection
    const usersCollectionRef = db.collection(`companies/${clientId}/users`)
    const costCentresCollectionRef = db.collection(
      `companies/${clientId}/costCentres`
    )

    // Lookup costCentreId by name
    const costCentreSnap = await costCentresCollectionRef
      .where('name', '==', body.costCentre)
      .limit(1)
      .get()

    if (costCentreSnap.empty) {
      return NextResponse.json(
        { error: 'Cost centre not found' },
        { status: 404 }
      )
    }

    const costCentreId = costCentreSnap.docs[0].id

    // Get last used custom ID (e.g. USR-010)
    const lastUserSnap = await usersCollectionRef
      .orderBy('id', 'desc')
      .limit(1)
      .get()

    let lastIdNum = 0
    if (!lastUserSnap.empty) {
      const lastId = lastUserSnap.docs[0].data().id
      lastIdNum = parseInt(lastId.split('-')[1]) || 0
    }

    const newId = `USR-${String(lastIdNum + 1).padStart(3, '0')}`

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: body.email,
      password: process.env.DEFAULT_USER_PASSWORD || 'TempPass123!',
      displayName: body.name,
      disabled: false,
    })

    const uid = userRecord.uid

    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      role: body.role,
      clientId: clientId,
      costCentreId: costCentreId,
    })

    // Prepare Firestore user doc
    const newUser = {
      ...body,
      uid,
      clientId,
      costCentreId,
      id: newId,
      status: body.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    await usersCollectionRef.doc(uid).set(newUser)

    // Extract the document reference and data
    const costCentreDoc = costCentreSnap.docs[0]
    const costCentreRef = costCentresCollectionRef.doc(costCentreDoc.id)
    const costCentreData = costCentreDoc.data()

    // Safely increment the users count
    await costCentreRef.update({
      users: (costCentreData.users || 0) + 1,
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    const firebaseError = error?.errorInfo?.code || error.code || ''
    let errorMessage = 'Server error'

    if (firebaseError === 'auth/email-already-exists') {
      errorMessage = 'A user with that email already exists.'
    } else if (firebaseError === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.'
    } else {
      errorMessage = error.message || 'An unexpected error occurred.'
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }

  // // Set custom claims
  // await auth.setCustomUserClaims(body.uid, role)

  // // References
  // const counterRef = db.collection('meta').doc('counters')
  // const userRef = db.collection('users').doc(body.uid)

  // let newUser = null

  // await db.runTransaction(async (transaction) => {
  //   const counterDoc = await transaction.get(counterRef)
  //   const current = counterDoc.exists ? counterDoc.data().userCount || 0 : 0
  //   const newCount = current + 1
  //   const newId = `USR-${String(newCount).padStart(3, '0')}`

  //   // Prepare new user object
  //   newUser = {
  //     ...body,
  //     id: newId,
  //     lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
  //   }

  //   // Update counter and save user
  //   transaction.set(counterRef, { userCount: newCount }, { merge: true })
  //   transaction.set(userRef, newUser)
  // })

  // console.log('newUser :>> ', newUser)
  // return NextResponse.json(newUser, { status: 201 })
}

// export async function POST(request) {
//   const body = await request.json()
//   const role = {
//     UserRole: body.role,
//     clientId: body.clientId,
//     costCentreId: body.costCentreId,
//   }
//   await auth.setCustomUserClaims(body.uid, role)

//   // Reference to 'users' collection
//   const usersRef = db.collection('users')

//   // Get all users to determine next ID
//   const snapshot = await usersRef.get()
//   const users = snapshot.docs.map((doc) => doc.data())

//   const counterRef = db.collection('meta').doc('counters')

//   await db.runTransaction(async (transaction) => {
//     const counterDoc = await transaction.get(counterRef)
//     const current = counterDoc.exists ? counterDoc.data().userCount || 0 : 0
//     const newCount = current + 1
//     const newId = `USR-${String(newCount).padStart(3, '0')}`

//     // Update counter
//     transaction.set(counterRef, { userCount: newCount }, { merge: true })

//     // Save user with new ID
//     const userRef = db.collection('users').doc(body.uid)
//     // Construct user object
//     const newUser = {
//       ...body,
//       id: newId,
//       lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
//     }

//     transaction.set(userRef, {
//       newUser,
//     })
//   })
//   console.log('newUser :>> ', newUser)
//   return NextResponse.json(newUser, { status: 201 })
// }

// lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// login
export const login = async (email, password) => {
  const results = await signInWithEmailAndPassword(auth, email, password)
  const tokenResult = await results.user.getIdTokenResult()

  const uid = results?.user?.uid
  const clientId = tokenResult?.claims?.clientId
  const userDocRef = doc(db, 'companies', clientId, 'users', uid)

  const activity = {
    timestamp: new Date().toISOString(),
    activity: 'User login',
  }

  // Fetch existing recentActivities
  const userDocSnap = await getDoc(userDocRef)
  let existingActivities = []

  if (userDocSnap.exists()) {
    existingActivities = userDocSnap.data()?.recentActivities || []
  }

  // Add new activity and limit to latest 10
  const updatedActivities = [activity, ...existingActivities]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)

  // Update Firestore
  await updateDoc(userDocRef, {
    recentActivities: updatedActivities,
  })
}

// logout
export const logout = (router) => {
  if (router) {
    router.push('/')
  }
  signOut(auth)
}

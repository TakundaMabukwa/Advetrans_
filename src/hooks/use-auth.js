'use client'

// react
import { useEffect } from 'react'

// client cookies
import Cookies from 'js-cookie'

// apis
// import * as cu_api from '@/context/auth-context/api'
// import * as cc_api from '@/context/cost-centres-context/api'
// import * as d_api from '@/context/drivers-context/api'
// import * as sp_api from '@/context/stop-points-context/api'
// import * as t_api from '@/context/trips-context/api'
// import * as u_api from '@/context/users-context/api'
// import * as v_api from '@/context/vehicles-context/api'
// import * as c_api from '@/context/clients-context/api'

// client db
import { login } from '@/lib/action/auth'

// import { onAuthStateChanged } from 'firebase/auth'
import { toast } from '@/hooks/use-toast'
// import { getAccessibleRoutes } from '@/hooks/get-accessible-routes'
// import { collection, onSnapshot } from 'firebase/firestore'

// manage token
export const getAuthToken = () => Cookies.get('firebaseIdToken') || undefined
export const setAuthToken = (token) =>
  Cookies.set('firebaseIdToken', token, { secure: true })
export const removeAuthToken = () => Cookies.remove('firebaseIdToken')

/**
 * Check if Firebase ID token is expired using Firebase best practices
 * @param {Object} tokenResult - Firebase ID token result object
 * @returns {boolean} - True if token is expired or will expire within 5 minutes
 */
export const isTokenExpired = (tokenResult) => {
  if (!tokenResult || !tokenResult.expirationTime) {
    console.warn('Invalid token result provided to isTokenExpired')
    return true
  }

  try {
    // Convert expiration time to milliseconds
    const expirationTime = new Date(tokenResult.expirationTime).getTime()
    const currentTime = Date.now()

    // Add 5-minute buffer to prevent edge cases
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    const isExpired = currentTime >= expirationTime - bufferTime

    console.log('Token expiration check:', {
      currentTime: new Date(currentTime).toISOString(),
      expirationTime: new Date(expirationTime).toISOString(),
      bufferTime: new Date(expirationTime - bufferTime).toISOString(),
      isExpired,
      timeUntilExpiry: expirationTime - currentTime,
    })

    if (isExpired) {
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please sign in again.',
        variant: 'destructive',
      })
    }

    return isExpired
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true // Assume expired if there's an error
  }
}

/**
 * Force refresh the Firebase ID token
 * @param {Object} user - Firebase user object
 * @returns {Promise<Object>} - New token result
 */
export const forceRefreshToken = async (user) => {
  try {
    // Force refresh the token
    await user.getIdToken(true)
    const newTokenResult = await user.getIdTokenResult()

    console.log('Token refreshed successfully')
    return newTokenResult
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
}

/**
 * Check if token needs refresh (expires within 10 minutes)
 * @param {Object} tokenResult - Firebase ID token result object
 * @returns {boolean} - True if token should be refreshed
 */
export const shouldRefreshToken = (tokenResult) => {
  if (!tokenResult || !tokenResult.expirationTime) {
    return true
  }

  try {
    const expirationTime = new Date(tokenResult.expirationTime).getTime()
    const currentTime = Date.now()
    const refreshThreshold = 10 * 60 * 1000 // 10 minutes in milliseconds

    return currentTime >= expirationTime - refreshThreshold
  } catch (error) {
    console.error('Error checking if token should be refreshed:', error)
    return true
  }
}

// manage user claims
export const getUserClaims = () => {
  const claims = Cookies.get('firebaseUserClaims')
  return claims ? JSON.parse(claims) : undefined
}
export const setUserClaims = (claims) =>
  Cookies.set('firebaseUserClaims', JSON.stringify(claims), { secure: true })
export const removeUserClaims = () => Cookies.remove('firebaseUserClaims')

// manage auth state
// export const checkAuthState = (currentUserDispatch, setLoading) => {
//   // useEffect(() => {
//   //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
//   //     if (user) {
//   //       try {
//   //         let tokenResult = await user.getIdTokenResult()

//   //         // Check if token should be refreshed
//   //         if (shouldRefreshToken(tokenResult)) {
//   //           console.log('Token needs refresh, refreshing...')
//   //           tokenResult = await forceRefreshToken(user)
//   //         }

//   //         const token = tokenResult.token
//   //         const claims = tokenResult.claims

//   //         if (token && !isTokenExpired(tokenResult)) {
//   //           setAuthToken(token)
//   //           setUserClaims(claims)

//   //           await cu_api.fetchCurrentUser(currentUserDispatch)
//   //         } else {
//   //           console.warn('Token expired or invalid, logging out...')
//   //           logout()
//   //           removeAuthToken()
//   //           removeUserClaims()
//   //           await cu_api.clearCurrentUser(currentUserDispatch)
//   //         }
//   //       } catch (error) {
//   //         console.error('Error in auth state check:', error)
//   //         toast({
//   //           title: 'Authentication Error',
//   //           description: 'Failed to authenticate. Please sign in again.',
//   //           variant: 'destructive',
//   //         })

//   //         // Clear everything on error
//   //         logout()
//   //         removeAuthToken()
//   //         removeUserClaims()
//   //         await cu_api.clearCurrentUser(currentUserDispatch)
//   //       } finally {
//   //         setLoading(false)
//   //       }
//   //     } else {
//   //       // User is signed out
//   //       removeAuthToken()
//   //       removeUserClaims()
//   //       await cu_api.clearCurrentUser(currentUserDispatch)
//   //       setLoading(false)
//   //     }
//   //   })

//   //   return () => unsubscribe()
//   // }, [])
// }

// check if user is authenticated
export const isAuthenticated = (current_user) => {
  return !!current_user?.currentUser?.uid
}

// Watch for currentUser changes to set routes and listen to costCentres
// export const watchCurrentUser = (
//   currentUser,
//   logout,
//   setRoutes,
//   costCentresDispatch
// ) => {
//   useEffect(() => {
//     const token = getAuthToken()
//     if (!currentUser || !token) {
//       logout()
//       return
//     }

//     setRoutes(getAccessibleRoutes(currentUser.permissions))

//     const unsubscribe = onSnapshot(
//       collection(db, `companies/${currentUser.clientId}/costCentres`),
//       () => cc_api.fetchCostCentres(costCentresDispatch)
//     )

//     return () => unsubscribe()
//   }, [currentUser])
// }

// Generic snapshot listeners for other collections
// export const watchCollections = (
//   currentUser,
//   clientsDispatch,
//   usersDispatch,
//   vehiclesDispatch,
//   driversDispatch,
//   stopPointsDispatch,
//   tripsDispatch
// ) => {
//   useEffect(() => {
//     const token = getAuthToken()
//     if (!currentUser || !token) return

//     const collectionsToWatch = [
//       {
//         name: 'clients',
//         fetchFn: () => c_api.fetchClients(clientsDispatch),
//       },
//       { name: 'users', fetchFn: () => u_api.fetchUsers(usersDispatch) },
//       {
//         name: 'vehicles',
//         fetchFn: () => v_api.fetchVehicles(vehiclesDispatch),
//       },
//       {
//         name: 'drivers',
//         fetchFn: () => d_api.fetchDrivers(driversDispatch),
//       },
//       {
//         name: 'stopPoints',
//         fetchFn: () => sp_api.fetchStopPoints(stopPointsDispatch),
//       },
//       { name: 'trips', fetchFn: () => t_api.fetchTrips(tripsDispatch) },
//     ]

//     const unsubscribers = collectionsToWatch.map(({ name, fetchFn }) =>
//       onSnapshot(
//         collection(db, `companies/${currentUser.clientId}/${name}`),
//         fetchFn
//       )
//     )

//     return () => {
//       unsubscribers.forEach((unsub) => unsub())
//     }
//   }, [currentUser])
// }

// oncreate handler
export const onCreate = (setModalOpen, modalOpen, setHref) => {
  return (href) => {
    setModalOpen(!modalOpen)
    setHref(href)
  }
}

// onEdit handler
export const onEdit = (setModalOpen, modalOpen, setId) => {
  return ({ id }) => {
    setModalOpen(!modalOpen)

    if (id) {
      setId(id)
    }
  }
}

// onDelete handler
export const onDelete = (setAlertOpen, alertOpen, setId) => {
  return ({ id }) => {
    setAlertOpen(!alertOpen)
    if (id) {
      setId(id)
    }
  }
}

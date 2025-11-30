'use client'

// react
import { useReducer, useState } from 'react'

// context
import { AuthContext, initialUserState } from './context'

// reducers
import currentUserReducer from './reducer'

// client db
// import { login, logout } from '@/lib/client-db'

// components
// import PageLoader from '@/components/ui/loader'

// hooks
// import {
//   getAuthToken,
//   setAuthToken,
//   removeAuthToken,
//   getUserClaims,
//   isTokenExpired,
//   isAuthenticated,
//   setUserClaims,
//   removeUserClaims,
//   checkAuthState,
// } from '@/hooks/use-auth'

const AuthProvider = ({ children, authFallback }) => {
  const [current_user, currentUserDispatch] = useReducer(
    currentUserReducer,
    initialUserState
  )
  const [loading, setLoading] = useState(true)

  // checkAuthState(currentUserDispatch, setLoading)

  return (
    <AuthContext.Provider
      value={{
        current_user,
        // login,
        // logout,
        // getAuthToken,
        // setAuthToken,
        // removeAuthToken,/
        // getUserClaims,
        // isTokenExpired,
        // setUserClaims,
        // removeUserClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

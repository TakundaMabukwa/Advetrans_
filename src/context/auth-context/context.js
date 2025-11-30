// react
import { createContext, useContext } from 'react'

// initial state
export const initialUserState = {
  currentUser: null,
  loading: false,
  error: null,
}

// context
export const AuthContext = createContext(initialUserState)

// context provider
export const useAuth = () => {
  const context = useContext(AuthContext)
  return context
}

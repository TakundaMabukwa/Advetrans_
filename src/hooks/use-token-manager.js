import { useState, useEffect, useCallback } from 'react'
import {
  getValidToken,
  authenticatedFetch,
  isAuthenticatedWithValidToken,
  setupTokenRefreshListener,
  clearAuthData,
} from '@/utils/token-manager'
import { auth } from '@/lib/client-db'
import { onAuthStateChanged } from 'firebase/auth'

/**
 * React hook for Firebase token management
 * Provides authentication state and token utilities
 */
export const useTokenManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const isValid = await isAuthenticatedWithValidToken()
      setIsAuthenticated(isValid)

      if (isValid) {
        const currentToken = await getValidToken()
        setToken(currentToken)
      } else {
        setToken(null)
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      setIsAuthenticated(false)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Setup auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await checkAuth()
      } else {
        setIsAuthenticated(false)
        setToken(null)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [checkAuth])

  // Setup token refresh listener
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = setupTokenRefreshListener((newToken) => {
        setToken(newToken)
        console.log('Token refreshed via listener')
      })

      return () => unsubscribe()
    }
  }, [isAuthenticated])

  // Make authenticated API call
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    try {
      const response = await authenticatedFetch(url, options)
      return response
    } catch (error) {
      console.error('Authenticated request failed:', error)
      throw error
    }
  }, [])

  // Get current token
  const getCurrentToken = useCallback(async () => {
    return await getValidToken()
  }, [])

  // Force token refresh
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await getValidToken()
      setToken(newToken)
      return newToken
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }, [])

  // Logout and clear auth data
  const logout = useCallback(() => {
    clearAuthData()
    setIsAuthenticated(false)
    setToken(null)
  }, [])

  return {
    isAuthenticated,
    isLoading,
    token,
    checkAuth,
    makeAuthenticatedRequest,
    getCurrentToken,
    refreshToken,
    logout,
  }
}

/**
 * Hook for making authenticated API calls with automatic retry
 */
export const useAuthenticatedApi = () => {
  const { makeAuthenticatedRequest, isAuthenticated } = useTokenManager()

  const apiCall = useCallback(
    async (url, options = {}) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      try {
        const response = await makeAuthenticatedRequest(url, options)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        console.error('API call failed:', error)
        throw error
      }
    },
    [makeAuthenticatedRequest, isAuthenticated]
  )

  return { apiCall }
}

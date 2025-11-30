// axios
import axios from 'axios'

// actions
import * as api from './actions'

// client cookies js
import Cookies from 'js-cookie'

// hooks
import { toast } from '@/hooks/use-toast'

// api url
const API_URL = '/api/auth'

// *****************************
// fetch current user
// *****************************
export const fetchCurrentUser = async (currentUserDispatch) => {
  currentUserDispatch(api.fetchCurrentUserStart())

  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      currentUserDispatch(
        api.fetchCurrentUserFailure({ error: 'invalid user' })
      )
      return
    }
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      currentUserDispatch(api.fetchCurrentUserSuccess(responseData.data))
    } else {
      // Fallback for old format
      currentUserDispatch(api.fetchCurrentUserSuccess(responseData))
    }
  } catch (error) {
    currentUserDispatch(api.fetchCurrentUserFailure(error))
    toast({
      title: 'Something went wrong, fetching current user',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

// *****************************
// clear current user
// *****************************
export const clearCurrentUser = async (currentUserDispatch) => {
  currentUserDispatch(api.clearCurrentUserStart())

  currentUserDispatch(api.clearCurrentUserSuccess())
}

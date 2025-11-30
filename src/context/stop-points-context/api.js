// axios
import axios from 'axios'

// actions
import * as api from './actions'

// client cookies js
import Cookies from 'js-cookie'

// hooks
import { toast } from '@/hooks/use-toast'
import { fetchApi } from '@/hooks/use-apis'

// api url
const API_URL = '/api/stop-points'

// *****************************
// fetch stop points
// *****************************
export const fetchStopPoints = async (stopPointsDispatch) => {
  fetchApi({
    dispatch: stopPointsDispatch,
    start: api.fetchStopPointsStart,
    success: api.fetchStopPointsSuccess,
    failure: api.fetchStopPointsFailure,
    errorMsg: 'Something went wrong, while fetching stop points',
    url: API_URL,
  })
}

// *****************************
// add stop point
// *****************************
export const addStopPoint = async (stopPoint, stopPointsDispatch) => {
  stopPointsDispatch(api.addStopPointStart())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      stopPointsDispatch(api.addStopPointFailure({ error: 'invalid user' }))
      return
    }
    const response = await axios.post(`${API_URL}`, stopPoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      stopPointsDispatch(api.addStopPointSuccess(responseData.data))
    } else {
      // Fallback for old format
      stopPointsDispatch(api.addStopPointSuccess(responseData))
    }

    toast({
      title: 'Stop point added successfully',
      description: responseData?.message || 'Stop point has been added.',
    })
  } catch (error) {
    stopPointsDispatch(api.addStopPointFailure(error))
    toast({
      title: 'Something went wrong, while adding stop point',
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
// update stop point
// *****************************
export const updateStopPoint = async (id, stopPoint, stopPointsDispatch) => {
  stopPointsDispatch(api.updateStopPointStart())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      stopPointsDispatch(api.updateStopPointFailure({ error: 'invalid user' }))
      return
    }
    const response = await axios.put(`${API_URL}/${id}`, stopPoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      stopPointsDispatch(api.updateStopPointSuccess(responseData.data))
    } else {
      // Fallback for old format
      stopPointsDispatch(api.updateStopPointSuccess(responseData))
    }

    toast({
      title: 'Stop point updated successfully',
      description: responseData?.message || 'Stop point has been updated.',
    })
  } catch (error) {
    stopPointsDispatch(api.updateStopPointFailure(error))
    toast({
      title: 'Something went wrong, while updating stop point',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

export const upsertStopPoints = async (id, stopPoint, stopPointsDispatch) =>
  id
    ? updateStopPoint(id, stopPoint, stopPointsDispatch)
    : addStopPoint(stopPoint, stopPointsDispatch)

// *****************************
// delete stop point
// *****************************
export const deleteStopPoint = async (id, stopPointsDispatch) => {
  stopPointsDispatch(api.deleteStopPointStart())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      stopPointsDispatch(api.deleteStopPointFailure({ error: 'invalid user' }))
      return
    }
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      stopPointsDispatch(api.deleteStopPointSuccess(responseData.data))
    } else {
      // Fallback for old format
      stopPointsDispatch(api.deleteStopPointSuccess(responseData))
    }

    toast({
      title: 'Stop point removed successfully',
      description: responseData?.message || 'Stop point has been removed.',
    })
  } catch (error) {
    stopPointsDispatch(api.deleteStopPointFailure(error))
    toast({
      title: 'Something went wrong, while removing stop point',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = '/api/dashboard'

export const fetchDashboardData = async () => {
  try {
    const token = Cookies.get('firebaseIdToken')
    const response = await axios.get(`api/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      return responseData.data
    } else {
      // Fallback for old format
      return responseData
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

export const updateDashboardStats = async (stats) => {
  try {
    const token = Cookies.get('firebaseIdToken')
    const response = await axios.put(`${API_URL}/stats`, stats, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      return responseData.data
    } else {
      // Fallback for old format
      return responseData
    }
  } catch (error) {
    console.error('Error updating dashboard stats:', error)
    throw error
  }
}

// axios
import axios from 'axios'

// client cookies js
import Cookies from 'js-cookie'

// hooks
import { toast } from '@/hooks/use-toast'

export const fetchApi = async ({
  dispatch,
  start,
  success,
  failure,
  errorMsg,
  url,
}) => {
  dispatch(start())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      dispatch(failure({ error: 'invalid user' }))
      return
    }
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      dispatch(success(responseData.data))
    } else {
      // Fallback for old format
      dispatch(success(responseData))
    }
  } catch (error) {
    dispatch(failure(error))
    toast({
      title: errorMsg ? errorMsg : 'Something went wrong, while fetching data',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

export const postApi = async ({
  dispatch,
  start,
  data,
  success,
  successMsg,
  failure,
  errorMsg,
  url,
}) => {
  dispatch(start())

  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      dispatch(failure({ error: 'invalid user' }))
      return
    }
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      dispatch(success(responseData.data))
    } else {
      // Fallback for old format
      dispatch(success(responseData))
    }

    toast({
      title: successMsg || 'Operation was successful',
      description: responseData?.message || '',
    })
  } catch (error) {
    dispatch(failure(error))
    toast({
      title: errorMsg ? errorMsg : 'Something went wrong',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

export const putApi = async ({
  dispatch,
  start,
  id,
  data,
  success,
  successMsg,
  failure,
  errorMsg,
  url,
}) => {
  dispatch(start())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      dispatch(failure({ error: 'invalid user' }))
      return
    }
    const response = await axios.put(`${url}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      dispatch(success(responseData.data))
    } else {
      // Fallback for old format
      dispatch(success(responseData))
    }

    toast({
      title: successMsg || 'Operation was successful',
      description: responseData?.message || '',
    })
  } catch (error) {
    dispatch(failure(error))
    toast({
      title: errorMsg ? errorMsg : 'Something went wrong',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

export const deleteApi = async ({
  dispatch,
  start,
  id,
  success,
  successMsg,
  failure,
  errorMsg,
  url,
}) => {
  console.log('url :>> ', `${url}/${id}`)
  dispatch(start())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      dispatch(failure({ error: 'invalid user' }))
      return
    }
    const response = await axios.delete(`${url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      dispatch(success(responseData.data))
    } else {
      // Fallback for old format
      dispatch(success(responseData))
    }

    toast({
      title: successMsg || 'Operation was successful',
      description: responseData?.message || '',
    })
  } catch (error) {
    dispatch(failure(error))
    toast({
      title: errorMsg ? errorMsg : 'Something went wrong',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        'Unknown error',
      variant: 'destructive',
    })
  }
}

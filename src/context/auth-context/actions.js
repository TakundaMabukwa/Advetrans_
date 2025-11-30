// action types
import * as types from '@/constants/types'

// *****************************
// fetch current user
// *****************************
export const fetchCurrentUserStart = () => ({
  type: types.REQUEST_START,
})
export const fetchCurrentUserSuccess = (data) => ({
  type: types.FETCH_CURRENT_USER,
  payload: data,
})
export const fetchCurrentUserFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// clear current user
// *****************************
export const clearCurrentUserStart = () => ({
  type: types.REQUEST_START,
})
export const clearCurrentUserSuccess = () => ({
  type: types.CLEAR_CURRENT_USER,
  payload: {},
})
export const clearCurrentUserFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// action types
import * as types from '@/constants/types'

// *****************************
// fetch cost centres
// *****************************
export const fetchClientsStart = () => ({
  type: types.REQUEST_START,
})
export const fetchClientsSuccess = (data) => ({
  type: types.FETCH_CLIENTS,
  payload: data,
})
export const fetchClientsFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add cost centre
// *****************************
export const addClientsStart = () => ({
  type: types.REQUEST_START,
})
export const addClientsSuccess = (data) => ({
  type: types.ADD_CLIENT,
  payload: data,
})
export const addClientsFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update cost centre
// *****************************
export const updateClientStart = () => ({
  type: types.REQUEST_START,
})
export const updateClientSuccess = (data) => ({
  type: types.UPDATE_CLIENT,
  payload: data,
})
export const updateClientFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete cost centre
// *****************************
export const deleteClientStart = () => ({
  type: types.REQUEST_START,
})
export const deleteClientSuccess = (id) => ({
  type: types.DELETE_CLIENT,
  payload: id,
})
export const deleteClientFailure = () => ({
  type: types.REQUEST_FAILURE,
})

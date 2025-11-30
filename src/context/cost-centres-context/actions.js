// action types
import * as types from '@/constants/types'

// *****************************
// fetch cost centres
// *****************************
export const fetchCostCentresStart = () => ({
  type: types.REQUEST_START,
})
export const fetchCostCentresSuccess = (data) => ({
  type: types.FETCH_COST_CENTRES,
  payload: data,
})
export const fetchCostCentresFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add cost centre
// *****************************
export const addCostCentresStart = () => ({
  type: types.REQUEST_START,
})
export const addCostCentresSuccess = (data) => ({
  type: types.ADD_COST_CENTRE,
  payload: data,
})
export const addCostCentresFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update cost centre
// *****************************
export const updateCostCentreStart = () => ({
  type: types.REQUEST_START,
})
export const updateCostCentreSuccess = (data) => ({
  type: types.UPDATE_COST_CENTRE,
  payload: data,
})
export const updateCostCentreFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete cost centre
// *****************************
export const deleteCostCentreStart = () => ({
  type: types.REQUEST_START,
})
export const deleteCostCentreSuccess = (id) => ({
  type: types.DELETE_COST_CENTRE,
  payload: id,
})
export const deleteCostCentreFailure = () => ({
  type: types.REQUEST_FAILURE,
})

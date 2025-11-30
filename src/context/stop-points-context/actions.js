import * as types from '@/constants/types'

// *****************************
// fetch stop points
// *****************************
export const fetchStopPointsStart = () => ({
  type: types.REQUEST_START,
})

export const fetchStopPointsSuccess = (data) => ({
  type: types.FETCH_STOP_POINTS,
  payload: data,
})

export const fetchStopPointsFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add stop points
// *****************************
export const addStopPointStart = () => ({
  type: types.REQUEST_START,
})

export const addStopPointSuccess = (data) => ({
  type: types.ADD_STOP_POINT,
  payload: data,
})

export const addStopPointFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update stop points
// *****************************
export const updateStopPointStart = () => ({
  type: types.REQUEST_START,
})

export const updateStopPointSuccess = (data) => ({
  type: types.UPDATE_STOP_POINT,
  payload: data,
})

export const updateStopPointFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete stop points
// *****************************
export const deleteStopPointStart = () => ({
  type: types.REQUEST_START,
})

export const deleteStopPointSuccess = (id) => ({
  type: types.DELETE_STOP_POINT,
  payload: id,
})

export const deleteStopPointFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// old code for stop points actions
// *****************************

// export const deleteStopPoint = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     await api.deleteStopPoint(id)
//     dispatch({
//       type: types.DELETE_STOP_POINT,
//       payload: id,
//     })
//     dispatch({ type: types.REQUEST_SUCCESS })
//   } catch (error) {
//     dispatch({
//       type: types.REQUEST_FAILURE,
//       payload: error.message,
//     })
//     throw error
//   }
// }

// export const fetchStopPoints = () => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchStopPoints()
//     dispatch({
//       type: types.FETCH_STOP_POINTS,
//       payload: data,
//     })
//     dispatch({ type: types.REQUEST_SUCCESS })
//   } catch (error) {
//     dispatch({
//       type: types.REQUEST_FAILURE,
//       payload: error.message,
//     })
//   }
// }

// export const fetchStopPoint = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchStopPoint(id)
//     dispatch({
//       type: types.FETCH_STOP_POINT,
//       payload: data,
//     })
//     dispatch({ type: types.REQUEST_SUCCESS })
//   } catch (error) {
//     dispatch({
//       type: types.REQUEST_FAILURE,
//       payload: error.message,
//     })
//   }
// }
// export const addStopPoint = (stopPoint) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addStopPoint(stopPoint)
//     dispatch({
//       type: types.ADD_STOP_POINT,
//       payload: data,
//     })
//     dispatch({ type: types.REQUEST_SUCCESS })
//     return data
//   } catch (error) {
//     dispatch({
//       type: types.REQUEST_FAILURE,
//       payload: error.message,
//     })
//     throw error
//   }
// }
// export const updateStopPoint = (id, stopPoint) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.updateStopPoint(id, stopPoint)
//     dispatch({
//       type: types.UPDATE_STOP_POINT,
//       payload: data,
//     })
//     dispatch({ type: types.REQUEST_SUCCESS })
//     return data
//   } catch (error) {
//     dispatch({
//       type: types.REQUEST_FAILURE,
//       payload: error.message,
//     })
//     throw error
//   }
// }

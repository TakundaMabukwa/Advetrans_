import * as types from '@/constants/types'

// *****************************
// fetch drivers
// *****************************
export const fetchDriversStart = () => ({
  type: types.REQUEST_START,
})

export const fetchDriversSuccess = (data) => ({
  type: types.FETCH_DRIVERS,
  payload: data,
})

export const fetchDriversFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add drivers
// *****************************
export const addDriverStart = () => ({
  type: types.REQUEST_START,
})

export const addDriverSuccess = (data) => {
  console.log('data from action :>> ', data)
  return {
    type: types.ADD_DRIVER,
    payload: data,
  }
}

export const addDriverFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update drivers
// *****************************
export const updateDriverStart = () => ({
  type: types.REQUEST_START,
})

export const updateDriverSuccess = (data) => ({
  type: types.UPDATE_DRIVER,
  payload: data,
})

export const updateDriverFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete drivers
// *****************************
export const deleteDriverStart = () => ({
  type: types.REQUEST_START,
})

export const deleteDriverSuccess = (id) => ({
  type: types.DELETE_DRIVER,
  payload: id,
})

export const deleteDriverFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// assign vehicle to driver
// *****************************
export const assignVehicleToDriverStart = () => ({
  type: types.REQUEST_START,
})

export const assignVehicleToDriverSuccess = (id) => ({
  type: types.ASSIGN_VEHICLE_TO_DRIVER,
  payload: { driverId, vehicleId, data },
})

export const assignVehicleToDriverFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// old code for drivers actions
// *****************************
// export const addDriver = (driver) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addDriver(driver)
//     dispatch({
//       type: types.ADD_DRIVER,
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
// export const fetchDrivers = () => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchDrivers()
//     dispatch({
//       type: types.FETCH_DRIVERS,
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

// export const fetchDriver = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchDriver(id)
//     dispatch({
//       type: types.FETCH_DRIVER,
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

// export const deleteDriver = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     await api.deleteDriver(id)
//     dispatch({
//       type: types.DELETE_DRIVER,
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
// export const updateDriver = (id, driver) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.updateDriver(id, driver)
//     dispatch({
//       type: types.UPDATE_DRIVER,
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
// export const assignVehicleToDriver =
//   (driverId, vehicleId) => async (dispatch) => {
//     dispatch({ type: types.REQUEST_START })

//     try {
//       const data = await api.assignVehicleToDriver(driverId, vehicleId)
//       dispatch({
//         type: types.ASSIGN_VEHICLE_TO_DRIVER,
//         payload: { driverId, vehicleId, data },
//       })
//       dispatch({ type: types.REQUEST_SUCCESS })
//       return data
//     } catch (error) {
//       dispatch({
//         type: types.REQUEST_FAILURE,
//         payload: error.message,
//       })
//       throw error
//     }
//   }

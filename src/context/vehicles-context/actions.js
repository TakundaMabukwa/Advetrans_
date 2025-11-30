import * as types from '@/constants/types'

// *****************************
// fetch vehicles
// *****************************
export const fetchVehiclesStart = () => ({
  type: types.REQUEST_START,
})

export const fetchVehiclesSuccess = (data) => ({
  type: types.FETCH_VEHICLES,
  payload: data,
})

export const fetchVehiclesFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add vehicle
// *****************************
export const addVehicleStart = () => ({
  type: types.REQUEST_START,
})

export const addVehicleSuccess = (data) => ({
  type: types.ADD_VEHICLE,
  payload: data,
})

export const addVehicleFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update vehicle
// *****************************
export const updateVehicleStart = () => ({
  type: types.REQUEST_START,
})

export const updateVehicleSuccess = (data) => ({
  type: types.UPDATE_VEHICLE,
  payload: data,
})

export const updateVehicleFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete vehicle
// *****************************
export const deleteVehicleStart = () => ({
  type: types.REQUEST_START,
})

export const deleteVehicleSuccess = (id) => ({
  type: types.DELETE_VEHICLE,
  payload: id,
})

export const deleteVehicleFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add maintenance record
// *****************************
export const addMaintenanceRecordStart = () => ({
  type: types.REQUEST_START,
})

export const addMaintenanceRecordSuccess = (vehicleId, data) => ({
  type: types.ADD_MAINTENANCE_RECORD,
  payload: { vehicleId, record: data },
})

export const addMaintenanceRecordFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add fuel record
// *****************************
export const addFuelRecordStart = () => ({
  type: types.REQUEST_START,
})

export const addFuelRecordSuccess = (vehicleId, data) => ({
  type: types.ADD_FUEL_RECORD,
  payload: { vehicleId, record: data },
})

export const addFuelRecordFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// export const deleteVehicle = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     await api.deleteVehicle(id)
//     dispatch({
//       type: types.DELETE_VEHICLE,
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

// export const fetchVehicles = () => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchVehicles()
//     dispatch({
//       type: types.FETCH_VEHICLES,
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

// export const fetchVehicle = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchVehicle(id)
//     dispatch({
//       type: types.FETCH_VEHICLE,
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
// export const addVehicle = (vehicle) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addVehicle(vehicle)
//     dispatch({
//       type: types.ADD_VEHICLE,
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
// export const updateVehicle = (id, vehicle) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.updateVehicle(id, vehicle)
//     dispatch({
//       type: types.UPDATE_VEHICLE,
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
// export const addMaintenanceRecord = (vehicleId, record) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addMaintenanceRecord(vehicleId, record)
//     dispatch({
//       type: types.ADD_MAINTENANCE_RECORD,
//       payload: { vehicleId, record: data },
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
// export const addFuelRecord = (vehicleId, record) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addFuelRecord(vehicleId, record)
//     dispatch({
//       type: types.ADD_FUEL_RECORD,
//       payload: { vehicleId, record: data },
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

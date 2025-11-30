import * as types from '@/constants/types'

// *****************************
// fetch trips
// *****************************
export const fetchTripsStart = () => ({
  type: types.REQUEST_START,
})

export const fetchTripsSuccess = (data) => ({
  type: types.FETCH_TRIPS,
  payload: data,
})

export const fetchTripsFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add trip
// *****************************
export const addTripStart = () => ({
  type: types.REQUEST_START,
})

export const addTripSuccess = (data) => ({
  type: types.ADD_TRIP,
  payload: data,
})

export const addTripFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update trip
// *****************************
export const updateTripStart = () => ({
  type: types.REQUEST_START,
})

export const updateTripSuccess = (data) => ({
  type: types.UPDATE_TRIP,
  payload: data,
})

export const updateTripFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete trips
// *****************************
export const deleteTripStart = () => ({
  type: types.REQUEST_START,
})

export const deleteTripSuccess = (id) => ({
  type: types.DELETE_TRIP,
  payload: id,
})

export const deleteTripFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update trip status
// *****************************
export const updateTripStatusStart = () => ({
  type: types.REQUEST_START,
})

export const updateTripStatusSuccess = (id, status, data) => ({
  type: types.UPDATE_TRIP_STATUS,
  payload: { id, status, data },
})

export const updateTripStatusFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add trip waypoint
// *****************************
export const addTripWaypointStart = () => ({
  type: types.REQUEST_START,
})

export const addTripWaypointSuccess = (tripId, data) => ({
  type: types.ADD_TRIP_WAYPOINT,
  payload: { tripId, waypoint: data },
})

export const addTripWaypointFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add trip update
// *****************************
export const addTripUpdateStart = () => ({
  type: types.REQUEST_START,
})

export const addTripUpdateSuccess = (tripId, data) => ({
  type: types.ADD_TRIP_UPDATE,
  payload: { tripId, update: data },
})

export const addTripUpdateFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add trip expense
// *****************************
export const addTripExpenseStart = () => ({
  type: types.REQUEST_START,
})

export const addTripExpenseSuccess = (tripId, data) => ({
  type: types.ADD_TRIP_EXPENSE,
  payload: { tripId, expense: data },
})

export const addTripExpenseFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// old code for trips actions
// *****************************

// export const fetchTrips = () => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchTrips()
//     dispatch({
//       type: types.FETCH_TRIPS,
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

// export const fetchTrip = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchTrip(id)
//     dispatch({
//       type: types.FETCH_TRIP,
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

// export const deleteTrip = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     await api.deleteTrip(id)
//     dispatch({
//       type: types.DELETE_TRIP,
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
// export const addTrip = (trip) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addTrip(trip)
//     dispatch({
//       type: types.ADD_TRIP,
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
// export const updateTrip = (id, trip) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.updateTrip(id, trip)
//     dispatch({
//       type: types.UPDATE_TRIP,
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
// export const updateTripStatus = (id, status) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.updateTripStatus(id, status)
//     dispatch({
//       type: types.UPDATE_TRIP_STATUS,
//       payload: { id, status, data },
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
// export const addTripWaypoint = (tripId, waypoint) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addTripWaypoint(tripId, waypoint)
//     dispatch({
//       type: types.ADD_TRIP_WAYPOINT,
//       payload: { tripId, waypoint: data },
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
// export const addTripUpdate = (tripId, update) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addTripUpdate(tripId, update)
//     dispatch({
//       type: types.ADD_TRIP_UPDATE,
//       payload: { tripId, update: data },
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
// export const addTripExpense = (tripId, expense) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addTripExpense(tripId, expense)
//     dispatch({
//       type: types.ADD_TRIP_EXPENSE,
//       payload: { tripId, expense: data },
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

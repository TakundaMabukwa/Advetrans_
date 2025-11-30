// types
import * as types from '@/constants/types'

const tripReducer = (state, action) => {
  switch (action.type) {
    case types.REQUEST_START:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case types.REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
      }
    case types.REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case types.FETCH_TRIPS:
      return {
        ...state,
        data: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      }
    case types.FETCH_TRIP:
      return {
        ...state,
        currentTrip: action.payload,
        loading: false,
      }
    case types.ADD_TRIP:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? [...state.data, action.payload]
          : [action.payload],
        loading: false,
      }
    case types.UPDATE_TRIP:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [action.payload],
        currentTrip:
          state.currentTrip?.id === action.payload.id
            ? action.payload
            : state.currentTrip,
        loading: false,
      }
    case types.DELETE_TRIP:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.filter((item) => item.id !== action.payload)
          : [],
        currentTrip:
          state.currentTrip?.id === action.payload ? null : state.currentTrip,
        loading: false,
      }
    case types.UPDATE_TRIP_STATUS:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((trip) => {
              if (trip.id === action.payload.id) {
                return {
                  ...trip,
                  status: action.payload.status,
                }
              }
              return trip
            })
          : [],
        currentTrip:
          state.currentTrip?.id === action.payload.id
            ? {
                ...state.currentTrip,
                status: action.payload.status,
              }
            : state.currentTrip,
        loading: false,
      }
    case types.ADD_TRIP_WAYPOINT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((trip) => {
              if (trip.id === action.payload.tripId) {
                return {
                  ...trip,
                  waypoints: [
                    ...(trip.waypoints || []),
                    action.payload.waypoint,
                  ],
                }
              }
              return trip
            })
          : [],
        currentTrip:
          state.currentTrip?.id === action.payload.tripId
            ? {
                ...state.currentTrip,
                waypoints: [
                  ...(state.currentTrip.waypoints || []),
                  action.payload.waypoint,
                ],
              }
            : state.currentTrip,
        loading: false,
      }
    case types.ADD_TRIP_UPDATE:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((trip) => {
              if (trip.id === action.payload.tripId) {
                return {
                  ...trip,
                  updates: [...(trip.updates || []), action.payload.update],
                }
              }
              return trip
            })
          : [],
        currentTrip:
          state.currentTrip?.id === action.payload.tripId
            ? {
                ...state.currentTrip,
                updates: [
                  ...(state.currentTrip.updates || []),
                  action.payload.update,
                ],
              }
            : state.currentTrip,
        loading: false,
      }
    case types.ADD_TRIP_EXPENSE:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((trip) => {
              if (trip.id === action.payload.tripId) {
                return {
                  ...trip,
                  expenses: [...(trip.expenses || []), action.payload.expense],
                }
              }
              return trip
            })
          : [],
        currentTrip:
          state.currentTrip?.id === action.payload.tripId
            ? {
                ...state.currentTrip,
                expenses: [
                  ...(state.currentTrip.expenses || []),
                  action.payload.expense,
                ],
              }
            : state.currentTrip,
        loading: false,
      }
    default:
      return state
  }
}

export default tripReducer

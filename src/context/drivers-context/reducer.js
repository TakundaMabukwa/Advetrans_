// types
import * as types from '@/constants/types'

const driverReducer = (state, action) => {
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
    case types.FETCH_DRIVERS:
      return {
        ...state,
        data: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      }
    case types.FETCH_DRIVER:
      return {
        ...state,
        currentDriver: action.payload,
        loading: false,
      }
    case types.ADD_DRIVER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? [...state.data, action.payload]
          : [action.payload],
        loading: false,
      }
    case types.UPDATE_DRIVER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [action.payload],
        currentDriver:
          state.currentDriver?.id === action.payload.id
            ? action.payload
            : state.currentDriver,
        loading: false,
      }
    case types.DELETE_DRIVER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.filter((item) => item.id !== action.payload)
          : [],
        currentDriver:
          state.currentDriver?.id === action.payload
            ? null
            : state.currentDriver,
        loading: false,
      }
    case types.ASSIGN_VEHICLE_TO_DRIVER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((driver) => {
              if (driver.id === action.payload.driverId) {
                return {
                  ...driver,
                  currentVehicle: action.payload.vehicleId,
                }
              }
              return driver
            })
          : [],
        currentDriver:
          state.currentDriver?.id === action.payload.driverId
            ? {
                ...state.currentDriver,
                currentVehicle: action.payload.vehicleId,
              }
            : state.currentDriver,
        loading: false,
      }
    default:
      return state
  }
}

export default driverReducer

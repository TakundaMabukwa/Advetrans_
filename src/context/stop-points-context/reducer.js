// types
import * as types from '@/constants/types'

const stopPointReducer = (state, action) => {
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
    case types.FETCH_STOP_POINTS:
      return {
        ...state,
        data: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      }
    case types.FETCH_STOP_POINT:
      return {
        ...state,
        currentStopPoint: action.payload,
        loading: false,
      }
    case types.ADD_STOP_POINT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? [...state.data, action.payload]
          : [action.payload],
        loading: false,
      }
    case types.UPDATE_STOP_POINT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [action.payload],
        currentStopPoint:
          state.currentStopPoint?.id === action.payload.id
            ? action.payload
            : state.currentStopPoint,
        loading: false,
      }
    case types.DELETE_STOP_POINT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.filter((item) => item.id !== action.payload)
          : [],
        currentStopPoint:
          state.currentStopPoint?.id === action.payload
            ? null
            : state.currentStopPoint,
        loading: false,
      }
    default:
      return state
  }
}

export default stopPointReducer

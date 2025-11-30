// types
import * as types from '@/constants/types'

const clientReducer = (state, action) => {
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
    case types.FETCH_CLIENTS:
      return {
        ...state,
        data: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      }
    case types.FETCH_CLIENT:
      return {
        ...state,
        currentClient: action.payload,
        loading: false,
      }
    case types.ADD_CLIENT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? [...state.data, action.payload]
          : [action.payload],
        loading: false,
      }
    case types.UPDATE_CLIENT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [action.payload],
        currentClient:
          state.currentClient?.id === action.payload.id
            ? action.payload
            : state.currentClient,
        loading: false,
      }
    case types.DELETE_CLIENT:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.filter((item) => item.id !== action.payload)
          : [],
        currentClient:
          state.currentClient?.id === action.payload
            ? null
            : state.currentClient,
        loading: false,
      }
    default:
      return state
  }
}

export default clientReducer

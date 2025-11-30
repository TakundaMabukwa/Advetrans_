// types
import * as types from '@/constants/types'

const usersReducer = (state, action) => {
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
    case types.FETCH_USERS:
      return {
        ...state,
        data: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
      }
    case types.FETCH_USER:
      return {
        ...state,
        currentUser: action.payload,
        loading: false,
      }
    case types.ADD_USER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? [...state.data, action.payload]
          : [action.payload],
        loading: false,
      }
    case types.UPDATE_USER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [action.payload],
        // currentUser:
        //   state.currentUser?.id === action.payload.id
        //     ? action.payload
        //     : state.currentUser,
        loading: false,
      }
    case types.DELETE_USER:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.filter((item) => item.id !== action.payload)
          : [],
        currentUser:
          state.currentUser?.id === action.payload ? null : state.currentUser,
        loading: false,
      }
    default:
      return state
  }
}

export default usersReducer

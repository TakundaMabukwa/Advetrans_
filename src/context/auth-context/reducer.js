// types
import * as types from '@/constants/types'

const currentUserReducer = (state, action) => {
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

    case types.FETCH_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload,
        loading: false,
      }

    case types.CLEAR_CURRENT_USER:
      return {
        ...state,
        currentUser: {},
        loading: false,
      }
    default:
      return state
  }
}
export default currentUserReducer

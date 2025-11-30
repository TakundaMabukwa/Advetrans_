// types
import * as types from '@/constants/types'

const dashboardReducer = (state, action) => {
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
    case types.FETCH_DASHBOARD_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
      }
    case types.UPDATE_DASHBOARD_STATS:
      return {
        ...state,
        dashboardStats: action.payload,
        loading: false,
      }
    default:
      return state
  }
}

export default dashboardReducer

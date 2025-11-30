import * as types from '@/constants/types'
import * as api from './api'

// *****************************
// fetch dashboard data
// *****************************
export const fetchDashboardData = () => async (dispatch) => {
  dispatch({ type: types.REQUEST_START })

  try {
    const data = await api.fetchDashboardData()
    dispatch({
      type: types.FETCH_DASHBOARD_DATA,
      payload: data,
    })
    dispatch({ type: types.REQUEST_SUCCESS })
  } catch (error) {
    dispatch({
      type: types.REQUEST_FAILURE,
      payload: error.message,
    })
  }
}

// *****************************
// updateDashboardStats
// *****************************
export const updateDashboardStats = (stats) => async (dispatch) => {
  dispatch({ type: types.REQUEST_START })

  try {
    const data = await api.updateDashboardStats(stats)
    dispatch({
      type: types.UPDATE_DASHBOARD_STATS,
      payload: data,
    })
    dispatch({ type: types.REQUEST_SUCCESS })
  } catch (error) {
    dispatch({
      type: types.REQUEST_FAILURE,
      payload: error.message,
    })
  }
}

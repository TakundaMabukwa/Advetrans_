// types
import * as types from '@/constants/types'

const costCentreReducer = (state, action) => {
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
    case types.FETCH_COST_CENTRES:
      return {
        ...state,
        data: action.payload,
        loading: false,
      }
    case types.FETCH_COST_CENTRE:
      return {
        ...state,
        currentCostCentre: action.payload,
        loading: false,
      }
    case types.ADD_COST_CENTRE:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? [...state.data, action.payload]
          : [action.payload],
        loading: false,
      }
    case types.UPDATE_COST_CENTRE:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.map((item) =>
              item.id === action.payload.id ? action.payload : item
            )
          : [action.payload],
        currentCostCentre:
          state.currentCostCentre?.id === action.payload.id
            ? action.payload
            : state.currentCostCentre,
        loading: false,
      }
    case types.DELETE_COST_CENTRE:
      return {
        ...state,
        data: Array.isArray(state.data)
          ? state.data.filter((item) => item.id !== action.payload)
          : [],
        currentCostCentre:
          state.currentCostCentre?.id === action.payload
            ? null
            : state.currentCostCentre,
        loading: false,
      }
    default:
      return state
  }
}

export default costCentreReducer

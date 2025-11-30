import * as types from '@/constants/types'

// *****************************
// fetch users
// *****************************
export const fetchUsersStart = () => ({
  type: types.REQUEST_START,
})

export const fetchUsersSuccess = (data) => ({
  type: types.FETCH_USERS,
  payload: data,
})

export const fetchUsersFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// add users
// *****************************
export const addUserStart = () => ({
  type: types.REQUEST_START,
})

export const addUserSuccess = (data) => ({
  type: types.ADD_USER,
  payload: data,
})

export const addUserFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// update user
// *****************************
export const updateUserStart = () => ({
  type: types.REQUEST_START,
})

export const updateUserSuccess = (data) => ({
  type: types.UPDATE_USER,
  payload: data,
})

export const updateUserFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// delete user
// *****************************
export const deleteUserStart = () => ({
  type: types.REQUEST_START,
})

export const deleteUserSuccess = (id) => ({
  type: types.DELETE_USER,
  payload: id,
})

export const deleteUserFailure = () => ({
  type: types.REQUEST_FAILURE,
})

// *****************************
// old code for trips actions
// *****************************

// export const deleteUser = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     await api.deleteUser(id)
//     dispatch({
//       type: types.DELETE_USER,
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

// export const fetchUsers = () => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchUsers()
//     dispatch({
//       type: types.FETCH_USERS,
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

// export const fetchUser = (id) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.fetchUser(id)
//     dispatch({
//       type: types.FETCH_USER,
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
// export const addUser = (user) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.addUser(user)
//     dispatch({
//       type: types.ADD_USER,
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
// export const updateUser = (id, user) => async (dispatch) => {
//   dispatch({ type: types.REQUEST_START })

//   try {
//     const data = await api.updateUser(id, user)
//     dispatch({
//       type: types.UPDATE_USER,
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

// axios
import axios from 'axios'

// actions
import * as actions from './actions'

// client cookies js
import Cookies from 'js-cookie'

// hooks
import { toast } from '@/hooks/use-toast'
import { deleteApi, fetchApi, postApi, putApi } from '@/hooks/use-apis'

// api url
const API_URL = '/api/drivers'

// *****************************
// fetch drivers
// *****************************
export const fetchDrivers = async (driversDispatch) => {
  fetchApi({
    dispatch: driversDispatch,
    start: actions.fetchDriversStart,
    success: actions.fetchDriversSuccess,
    failure: actions.fetchDriversFailure,
    errorMsg: 'Something went wrong, while fetching drivers',
    url: API_URL,
  })
}

// *****************************
// add driver
// *****************************
const addDriver = async (driver, driversDispatch) =>
  postApi({
    dispatch: driversDispatch,
    start: actions.addDriverStart,
    data: driver,
    success: actions.addDriverSuccess,
    successMsg: `New driver, with name: ${driver.name} has been created.`,
    failure: actions.addDriverFailure,
    errorMsg: 'Something went wrong, while adding driver',
    url: API_URL,
  })

// *****************************
//update driver
// *****************************
const updateDriver = async (id, driver, driversDispatch) =>
  putApi({
    dispatch: driversDispatch,
    start: actions.updateDriverStart,
    id,
    data: driver,
    success: actions.updateDriverSuccess,
    successMsg: `Driver, with id: ${id} and name: ${driver.name} was updated.`,
    failure: actions.updateDriverFailure,
    errorMsg: 'Something went wrong, while updating driver',
    url: API_URL,
  })

// *****************************
// move upsert to hooks or helpers(chat with cam)
// *****************************
export const upsertDriver = async (id, driver, driversDispatch) =>
  id
    ? updateDriver(id, driver, driversDispatch)
    : addDriver(driver, driversDispatch)

// *****************************
// delete driver
// *****************************
export const deleteDriver = async (id, driversDispatch) =>
  deleteApi({
    dispatch: driversDispatch,
    start: actions.deleteDriverStart,
    id,
    success: actions.deleteDriverSuccess,
    successMsg: `Driver with id: ${id} has been deleted.`,
    failure: actions.deleteDriverFailure,
    errorMsg: 'Something went wrong, while deleting driver',
    url: API_URL,
  })

// *****************************
// assign vehicle to driver
// *****************************
export const assignVehicleToDriver = async (
  driverId,
  vehicleId,
  driversDispatch
) => {
  driversDispatch(actions.assignVehicleToDriverStart())
  try {
    const token = Cookies.get('firebaseIdToken')
    if (!token) {
      driversDispatch(
        actions.assignVehicleToDriverFailure({ error: 'invalid user' })
      )
      return
    }
    const response = await axios.post(
      `${API_URL}/${driverId}/assign-vehicle`,
      {
        vehicleId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      driversDispatch(actions.assignVehicleToDriverSuccess(responseData.data))
    } else {
      // Fallback for old format
      driversDispatch(actions.assignVehicleToDriverSuccess(responseData))
    }

    toast({
      title: 'Driver updated successfully',
      description: responseData?.message || `Driver has been assigned vehicle.`,
    })
  } catch (error) {
    driversDispatch(actions.assignVehicleToDriverFailure(error))
    toast({
      title: 'Something went wrong while adding vehicle to driver',
      description:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        `Error assigning vehicle to driver ${driverId}:`,
      variant: 'destructive',
    })
  }
}

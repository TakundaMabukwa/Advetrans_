// axios
import axios from 'axios'

// actions
import * as api from './actions'

// client cookies js
import Cookies from 'js-cookie'

// hooks
import { toast } from '@/hooks/use-toast'
import { deleteApi, fetchApi, postApi, putApi } from '@/hooks/use-apis'

// api url
const API_URL = '/api/vehicles'

// *****************************
// fetch vehicles
// *****************************
export const fetchVehicles = async (vehiclesDispatch) => {
  fetchApi({
    dispatch: vehiclesDispatch,
    start: api.fetchVehiclesStart,
    success: api.fetchVehiclesSuccess,
    failure: api.fetchVehiclesFailure,
    errorMsg: 'Something went wrong, while fetching vehicles',
    url: API_URL,
  })
}

// *****************************
// add vehicle
// *****************************
export const addVehicle = async (vehicle, vehiclesDispatch) =>
  postApi({
    dispatch: vehiclesDispatch,
    start: api.addVehicleStart,
    data: vehicle,
    success: api.addVehicleSuccess,
    successMsg: `New vehicle, with id: ${vehicle.id} and name: ${vehicle.name} has been created.`,
    failure: api.addVehicleFailure,
    errorMsg: 'Something went wrong, while adding vehicle',
    url: API_URL,
  })

// *****************************
// update vehicle
// *****************************
export const updateVehicle = async (id, vehicle, vehiclesDispatch) =>
  putApi({
    dispatch: vehiclesDispatch,
    start: api.updateVehicleStart,
    id,
    data: vehicle,
    success: api.updateVehicleSuccess,
    successMsg: `Vehicle, with id: ${id} and model: ${vehicle.model} was updated.`,
    failure: api.updateVehicleFailure,
    errorMsg: 'Something went wrong, while updating vehicle',
    url: API_URL,
  })

// *****************************
// move upsert to hooks or helpers(chat with cam)
// *****************************

export const upsertVehicle = async (id, vehicle, vehiclesDispatch) =>
  id
    ? updateVehicle(id, vehicle, vehiclesDispatch)
    : addVehicle(vehicle, vehiclesDispatch)

// *****************************
// delete vehicle
// *****************************
export const deleteVehicle = async (id, vehiclesDispatch) =>
  deleteApi({
    dispatch: vehiclesDispatch,
    start: api.deleteVehicleStart,
    id,
    success: api.deleteVehicleSuccess,
    successMsg: `Vehicle with id: ${id} has been deleted.`,
    failure: api.deleteVehicleFailure,
    errorMsg: 'Something went wrong, while deleting vehicle',
    url: API_URL,
  })

// *****************************
// add maintenance record
// *****************************
export const addMaintenanceRecord = async (
  vehicleId,
  record,
  vehiclesDispatch
) => {
  vehiclesDispatch(api.addMaintenanceRecordStart())
  try {
    const token = Cookies.get('firebaseIdToken')
    const response = await axios.post(
      `${API_URL}/${vehicleId}/maintenance`,
      record,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      vehiclesDispatch(api.addMaintenanceRecordSuccess(responseData.data))
    } else {
      // Fallback for old format
      vehiclesDispatch(api.addMaintenanceRecordSuccess(responseData))
    }
  } catch (error) {
    console.error(
      `Error adding maintenance record for vehicle ${vehicleId}:`,
      error
    )
    vehiclesDispatch(api.addMaintenanceRecordFailure(error))
  }
}

// *****************************
// add fuel record
// *****************************
export const addFuelRecord = async (vehicleId, record, vehiclesDispatch) => {
  vehiclesDispatch(api.addFuelRecordStart())
  try {
    const token = Cookies.get('firebaseIdToken')
    const response = await axios.post(`${API_URL}/${vehicleId}/fuel`, record, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle new standardized response format
    const responseData = response.data
    if (responseData.success && responseData.data !== undefined) {
      vehiclesDispatch(api.addFuelRecordSuccess(responseData.data))
    } else {
      // Fallback for old format
      vehiclesDispatch(api.addFuelRecordSuccess(responseData))
    }
  } catch (error) {
    console.error(`Error adding fuel record for vehicle ${vehicleId}:`, error)
    vehiclesDispatch(api.addFuelRecordFailure(error))
  }
}

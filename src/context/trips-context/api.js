import { createClient } from '@/lib/supabase/client'
import * as api from './actions'

// Fetch trips
export const fetchTrips = async (tripsDispatch) => {
    tripsDispatch(api.fetchTripsStart())
    try {
        const supabase = createClient()
        // select all trips: use the project's `trips` table first; fallback to `trips`
        let data
        let error
        let usedTable = null

            ({ data, error } = await supabase.from('trips').select('*'))
        if (!error && Array.isArray(data)) usedTable = 'trips'

        if (!usedTable) {
            ({ data, error } = await supabase.from('trips').select('*'))
            if (!error && Array.isArray(data)) usedTable = 'trips'
        }

        console.debug('fetchTrips usedTable=', usedTable, 'rows=', (data || []).length)

        if (error) {
            tripsDispatch(api.fetchTripsFailure(error))
            return
        }
        tripsDispatch(api.fetchTripsSuccess(data || []))
    } catch (err) {
        tripsDispatch(api.fetchTripsFailure(err))
    }
}



// Upsert (insert or update) a trip
export const upsertTrip = async (id, tripData, tripsDispatch) => {
    if (!tripData) return

    // map form fields (camelCase) to DB column names (snake_case)
    const payload = {
        trip_id: tripData.id || tripData.trip_id,
        order_number: tripData.orderNumber || tripData.order_number,
        rate: tripData.rate,
        cost_centre: tripData.costCentre || tripData.cost_centre,
        start_date: tripData.startDate || tripData.start_date,
        end_date: tripData.endDate || tripData.end_date,
        cargo: tripData.cargo,
        cargo_weight: tripData.cargoWeight || tripData.cargo_weight,
        notes: tripData.notes,
        driver: tripData.driver,
        drivers: tripData.drivers || tripData.drivers || null,
        vehicle: tripData.vehicle,
        vehicles: tripData.vehicles || null,
        vehicle_assignments: tripData.vehicleAssignments || tripData.vehicle_assignments || null,
        origin: tripData.origin,
        destination: tripData.destination,
        route: tripData.route,
        distance: tripData.distance,
        client_details: tripData.clientDetails || tripData.client_details || null,
        selected_client: tripData.selectedClient || tripData.selected_client || (tripData.clientDetails?.name || null),
        pickup_locations: tripData.pickupLocations || tripData.pickup_locations || null,
        dropoff_locations: tripData.dropoffLocations || tripData.dropoff_locations || null,
        stop_points: tripData.stopPoints || tripData.stop_points || null,
        selected_stop_points: tripData.selectedStopPoints || tripData.selected_stop_points || null,
        waypoints: tripData.waypoints || null,
        status: tripData.status || 'pending',
        status_notes: tripData.statusNotes || tripData.status_notes || null,
    }

    const supabase = createClient()

    // Update existing trip by trip_id (trip form uses TRP-... as id)
    if (id) {
        tripsDispatch(api.updateTripStart())
        try {
            // update: prefer the project's `trips` table first; fallback to `trips`
            let data
            let error
            let usedTable = null

                ({ data, error } = await supabase.from('trips').update(payload).eq('id', id).select())
            if (!error && data) usedTable = 'trips'

            if (!usedTable) {
                ({ data, error } = await supabase.from('trips').update(payload).eq('id', id).select())
                if (!error && data) usedTable = 'trips'
            }

            console.debug('updateTrip usedTable=', usedTable, 'updated=', data)

            if (error) {
                tripsDispatch(api.updateTripFailure(error))
                return
            }
            tripsDispatch(api.updateTripSuccess(data?.[0] || data))
            return data?.[0] || data
        } catch (err) {
            tripsDispatch(api.updateTripFailure(err))
        }
        return
    }

    // Insert new trip
    tripsDispatch(api.addTripStart())
    try {
        // insert: prefer the project's `trips` table first; fallback to `trips`
        let data
        let error
        let usedTable = null

            ({ data, error } = await supabase.from('trips').insert(payload).select())
        if (!error && data) usedTable = 'trips'

        if (!usedTable) {
            ({ data, error } = await supabase.from('trips').insert(payload).select())
            if (!error && data) usedTable = 'trips'
        }

        console.debug('addTrip usedTable=', usedTable, 'inserted=', data)

        if (error) {
            tripsDispatch(api.addTripFailure(error))
            return
        }
        tripsDispatch(api.addTripSuccess(data?.[0] || data))
        return data?.[0] || data
    } catch (err) {
        tripsDispatch(api.addTripFailure(err))
    }
}

export const deleteTrip = async (id, tripsDispatch) => {
    tripsDispatch(api.deleteTripStart())
    try {
        const supabase = createClient()
        let error
        let usedTable = null

            ({ error } = await supabase.from('trips').delete().eq('id', id))
        if (!error) usedTable = 'trips'

        if (!usedTable) {
            ({ error } = await supabase.from('trips').delete().eq('id', id))
            if (!error) usedTable = 'trips'
        }

        console.debug('deleteTrip usedTable=', usedTable, 'id=', id)

        if (error) {
            tripsDispatch(api.deleteTripFailure(error))
            return
        }
        tripsDispatch(api.deleteTripSuccess(id))
    } catch (err) {
        tripsDispatch(api.deleteTripFailure(err))
    }
}

export default {
    fetchTrips,
    upsertTrip,
    deleteTrip,
}
// // axios
// import axios from 'axios'

// // actions
// import * as action from './actions'

// // client cookies js
// import Cookies from 'js-cookie'

// // hooks
// import { toast } from '@/hooks/use-toast'
// import { fetchApi } from '@/hooks/use-apis'

// // api url
// const API_URL = '/api/trips'

// // *****************************
// // fetch trips
// // *****************************
// export const fetchTrips = async (tripsDispatch) => {
//   fetchApi({
//     dispatch: tripsDispatch,
//     start: action.fetchTripsStart,
//     success: action.fetchTripsSuccess,
//     failure: action.fetchTripsFailure,
//     errorMsg: 'Something went wrong, while fetching trips',
//     url: API_URL,
//   })
// }

// // *****************************
// // add trip
// // *****************************
// export const addTrip = async (trip, tripsDispatch) => {
//   tripsDispatch(action.addTripStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     if (!token) {
//       tripsDispatch(action.addTripFailure({ error: 'invalid user' }))
//       return
//     }
//     const response = await axios.post(`${API_URL}`, trip, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.addTripSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.addTripSuccess(responseData))
//     }

//     toast({
//       title: 'Trip added successfully',
//       description: responseData?.message || 'Trip has been added.',
//     })
//   } catch (error) {
//     tripsDispatch(action.addTripFailure(error))
//     toast({
//       title: 'Something went wrong, while adding trip',
//       description:
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error.message ||
//         'Unknown error',
//       variant: 'destructive',
//     })
//   }
// }

// // *****************************
// // update trip
// // *****************************
// export const updateTrip = async (id, trip, tripsDispatch) => {
//   tripsDispatch(action.updateTripStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     if (!token) {
//       tripsDispatch(action.updateTripFailure({ error: 'invalid user' }))
//       return
//     }
//     const response = await axios.put(`${API_URL}/${id}`, trip, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.updateTripSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.updateTripSuccess(responseData))
//     }

//     toast({
//       title: 'Trip updated successfully',
//       description: responseData?.message || 'Trip has been updated.',
//     })
//   } catch (error) {
//     tripsDispatch(action.updateTripFailure(error))
//     toast({
//       title: 'Something went wrong, while updating trip',
//       description:
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error.message ||
//         'Unknown error',
//       variant: 'destructive',
//     })
//   }
// }

// export const upsertTrip = async (id, trip, tripsDispatch) =>
//   id ? updateTrip(id, trip, tripsDispatch) : addTrip(trip, tripsDispatch)

// // *****************************
// // delete trip
// // *****************************
// export const deleteTrip = async (id, tripsDispatch) => {
//   tripsDispatch(action.deleteTripStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     if (!token) {
//       tripsDispatch(action.deleteTripFailure({ error: 'invalid user' }))
//       return
//     }
//     const response = await axios.delete(`${API_URL}/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.deleteTripSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.deleteTripSuccess(responseData))
//     }

//     toast({
//       title: 'Trip removed successfully',
//       description: responseData?.message || 'Trip has been deleted.',
//     })
//   } catch (error) {
//     tripsDispatch(action.deleteTripFailure(error))
//     toast({
//       title: 'Something went wrong, while removing trip',
//       description:
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error.message ||
//         'Unknown error',
//       variant: 'destructive',
//     })
//   }
// }

// // *****************************
// // update trip status
// // *****************************
// export const updateTripStatus = async (id, status, tripsDispatch) => {
//   tripsDispatch(action.updateTripStatusStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     const response = await axios.put(
//       `${API_URL}/${id}/status`,
//       {
//         status,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.updateTripStatusSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.updateTripStatusSuccess(responseData))
//     }
//   } catch (error) {
//     console.error(`Error updating status for trip ${id}:`, error)
//     tripsDispatch(action.updateTripStatusFailure(error))
//   }
// }

// // *****************************
// // add trip waypoint
// // *****************************
// export const addTripWaypoint = async (tripId, waypoint, tripsDispatch) => {
//   tripsDispatch(action.addTripWaypointStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     const response = await axios.post(
//       `${API_URL}/${tripId}/waypoints`,
//       waypoint,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.addTripWaypointSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.addTripWaypointSuccess(responseData))
//     }
//   } catch (error) {
//     console.error(`Error adding waypoint for trip ${tripId}:`, error)
//     tripsDispatch(action.addTripWaypointFailure(error))
//   }
// }

// // *****************************
// // add trip update
// // *****************************
// export const addTripUpdate = async (tripId, update, tripsDispatch) => {
//   tripsDispatch(action.addTripUpdateStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     const response = await axios.post(`${API_URL}/${tripId}/updates`, update, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.addTripUpdateSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.addTripUpdateSuccess(responseData))
//     }
//   } catch (error) {
//     console.error(`Error adding update for trip ${tripId}:`, error)
//     tripsDispatch(action.addTripUpdateFailure(error))
//   }
// }

// // *****************************
// // add trip expense
// // *****************************
// export const addTripExpense = async (tripId, expense, tripsDispatch) => {
//   tripsDispatch(action.addTripExpenseStart())
//   try {
//     const token = Cookies.get('firebaseIdToken')
//     const response = await axios.post(
//       `${API_URL}/${tripId}/expenses`,
//       expense,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     )

//     // Handle new standardized response format
//     const responseData = response.data
//     if (responseData.success && responseData.data !== undefined) {
//       tripsDispatch(action.addTripExpenseSuccess(responseData.data))
//     } else {
//       // Fallback for old format
//       tripsDispatch(action.addTripExpenseSuccess(responseData))
//     }
//   } catch (error) {
//     console.error(`Error adding expense for trip ${tripId}:`, error)
//     tripsDispatch(action.addTripExpenseFailure(error))
//   }
// }

// // export const fetchTrips = async () => {
// //   try {
// //     const response = await axios.get(`${API_URL}/trips`)
// //     return response.data
// //   } catch (error) {
// //     console.error('Error fetching trips:', error)
// //     throw error
// //   }
// // }

// // export const fetchTrip = async (id) => {
// //   try {
// //     const response = await axios.get(`${API_URL}/trips/${id}`)
// //     return response.data
// //   } catch (error) {
// //     console.error(`Error fetching trip ${id}:`, error)
// //     throw error
// //   }
// // }

// // export const deleteTrip = async (id) => {
// //   try {
// //     await axios.delete(`${API_URL}/trips/${id}`)
// //     return id
// //   } catch (error) {
// //     console.error(`Error deleting trip ${id}:`, error)
// //     throw error
// //   }
// // }

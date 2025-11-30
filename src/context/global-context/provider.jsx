'use client'
// react
import { useEffect, useReducer, useState } from 'react'

// icons
import {
  Building2,
  Users,
  Truck,
  Route,
  Wrench,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  UserCircle,
  MapPin,
  Map,
  Building,
  User,
} from 'lucide-react'

// context
import { useAuth } from '@/context/auth-context/context'
import { GlobalContext } from './context'

// reducers
import costCentreReducer from '@/context/cost-centres-context/reducer'
import clientReducer from '@/context/clients-context/reducer'
import dashboardReducer from '@/context/dashboard-context/reducer'
import driverReducer from '@/context/drivers-context/reducer'
import stopPointReducer from '@/context/stop-points-context/reducer'
import tripReducer from '@/context/trips-context/reducer'
import usersReducer from '@/context/users-context/reducer'
import vehicleReducer from '@/context/vehicles-context/reducer'

// states
import { initialCostCentresState } from '@/context/cost-centres-context/context'
import { initialClientState } from '@/context/clients-context/context'
import { initialDashboardState } from '@/context/dashboard-context/context'
import { initialDriversState } from '@/context/drivers-context/context'
import { initialStopPointsState } from '@/context/stop-points-context/context'
import { initialTripsState } from '@/context/trips-context/context'
import { initialUsersState } from '@/context/users-context/context'
import { initialVehiclesState } from '@/context/vehicles-context/context'

// api's
import * as cc_api from '@/context/cost-centres-context/api'
import * as d_api from '@/context/drivers-context/api'
import * as sp_api from '@/context/stop-points-context/api'
import * as t_api from '@/context/trips-context/api'
import * as u_api from '@/context/users-context/api'
import * as v_api from '@/context/vehicles-context/api'
import * as c_api from '@/context/clients-context/api'

// components
import AlertScreen from '@/components/layout/alert-screen'
import DialogScreen from '@/components/layout/dialog-screen'
// import DataViewer from '@/components/debug/DataViewer'

// hooks
import {
  onCreate,
  onDelete,
  onEdit,
  watchCollections,
  watchCurrentUser,
} from '@/hooks/use-auth'
import { downloadCSVFromTable } from '@/lib/csv-parser'

const GlobalProvider = ({ children }) => {
  const {
    current_user: { currentUser },
    logout,
  } = useAuth()

  const [cost_centres, costCentresDispatch] = useReducer(
    costCentreReducer,
    initialCostCentresState
  )
  const [clients, clientsDispatch] = useReducer(
    clientReducer,
    initialClientState
  )
  const [dashboard, dashboardDispatch] = useReducer(
    dashboardReducer,
    initialDashboardState
  )
  const [drivers, driversDispatch] = useReducer(
    driverReducer,
    initialDriversState
  )
  const [stop_points, stopPointsDispatch] = useReducer(
    stopPointReducer,
    initialStopPointsState
  )
  const [trips, tripsDispatch] = useReducer(tripReducer, initialTripsState)
  const [users, usersDispatch] = useReducer(usersReducer, initialUsersState)
  const [vehicles, vehiclesDispatch] = useReducer(
    vehicleReducer,
    initialVehiclesState
  )
  const [routes, setRoutes] = useState([
    {
      label: 'Dashboard',
      icon: 'ChartColumnBig',
      href: '/',
      color: 'text-sky-500',
    },
    {
      label: 'Vehicles',
      icon: 'Truck',
      href: '/vehicles',
      color: 'text-orange-500',
    },
    {
      label: 'Drivers',
      icon: 'UserCircle',
      href: '/drivers',
      color: 'text-green-700',
    },
    // {
    //   label: 'Fuel Can Bus',
    //   icon: 'Truck',
    //   href: '/fuel',
    //   color: 'text-blue-500',
    // },
    // {
    //   label: 'Reports',
    //   icon: 'ChartColumnBig',
    //   href: '/reports',
    //   color: 'text-blue-500',
    // },
    // {
    //   label: 'Jobs',
    //   icon: 'Wrench',
    //   href: '/jobs',
    //   color: 'text-yellow-500',
    // },
    // {
    //   label: 'Call Center',
    //   icon: 'Phone',
    //   href: '/callcenter',
    //   color: 'text-red-500',
    // },
  ])
  const [modalOpen, setModalOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [id, setId] = useState(null)
  const [href, setHref] = useState(null)
  const [dashboardState, setDashboardState] = useState({
    costCentre: 'All',
    period: '7',
  })
  // Handle select change for dashboard state
  const handleDashboardState = (field, value) => {
    setDashboardState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Watch for currentUser changes to set routes and listen to costCentres
  // watchCurrentUser(currentUser, logout, setRoutes, costCentresDispatch)
// 
  // Generic snapshot listeners for other collections
  // watchCollections(
  //   currentUser,
  //   clientsDispatch,
  //   usersDispatch,
  //   vehiclesDispatch,
  //   driversDispatch,
  //   stopPointsDispatch,
  //   tripsDispatch
  // )

  // Fetch initial data from APIs when a user is present
  useEffect(() => {
    if (!currentUser) return

    // prefer Supabase-backed APIs where implemented; server-backed APIs will also work
    try {
      c_api.fetchClients && c_api.fetchClients(clientsDispatch)
    } catch (e) {
      console.error('fetchClients error', e)
    }

    try {
      cc_api.fetchCostCentres && cc_api.fetchCostCentres(costCentresDispatch)
    } catch (e) {
      console.error('fetchCostCentres error', e)
    }

    try {
      d_api.fetchDrivers && d_api.fetchDrivers(driversDispatch)
    } catch (e) {
      console.error('fetchDrivers error', e)
    }

    try {
      v_api.fetchVehicles && v_api.fetchVehicles(vehiclesDispatch)
    } catch (e) {
      console.error('fetchVehicles error', e)
    }

    try {
      sp_api.fetchStopPoints && sp_api.fetchStopPoints(stopPointsDispatch)
    } catch (e) {
      console.error('fetchStopPoints error', e)
    }

    try {
      t_api.fetchTrips && t_api.fetchTrips(tripsDispatch)
    } catch (e) {
      console.error('fetchTrips error', e)
    }

    try {
      u_api.fetchUsers && u_api.fetchUsers(usersDispatch)
    } catch (e) {
      console.error('fetchUsers error', e)
    }
  }, [currentUser])

  useEffect(() => {
    if (!modalOpen) {
      setId(null)
      setHref(null)
    }
  }, [modalOpen])

  useEffect(() => {
    if (!alertOpen) {
      setId(null)
    }
  }, [alertOpen])

  // Ensure data is always an array with proper safety checks
  const usersData = Array.isArray(users?.data) ? users.data : []
  const vehiclesData = Array.isArray(vehicles?.data) ? vehicles.data : []
  const driversData = Array.isArray(drivers?.data) ? drivers.data : []
  const stopPointsData = Array.isArray(stop_points?.data)
    ? stop_points.data
    : []
  const clientsData = Array.isArray(clients?.data) ? clients.data : []
  const costCentresData = Array.isArray(cost_centres?.data)
    ? cost_centres.data
    : []

  // stats
  // const cost_centres_stats = [
  //   {
  //     title: 'Total Cost Centres',
  //     value: costCentresData.length || 0,
  //     icon: <Building2 className="h-4 w-4 xl:h-7 xl:w-7 text-violet-500" />,
  //   },
  //   {
  //     title: 'Total Users',
  //     value: usersData.length || 0,
  //     icon: <Users className="h-4 w-4 xl:h-7 xl:w-7 text-pink-700" />,
  //   },
  //   {
  //     title: 'Total Vehicles',
  //     value: vehiclesData.length || 0,
  //     icon: <Truck className="h-4 w-4 xl:h-7 xl:w-7 text-orange-500" />,
  //   },
  //   {
  //     title: 'Active Trips',
  //     value: 0,
  //     icon: <Route className="h-4 w-4 xl:h-7 xl:w-7 text-emerald-500" />,
  //   },
  // ]

  // const clients_stats = [
  //   {
  //     title: 'Total Clients',
  //     value: clientsData.length || 0,
  //     icon: <Building2 className="h-4 w-4 xl:h-7 xl:w-7 text-violet-500" />,
  //   },
  //   {
  //     title: 'Active Clients',
  //     value: clientsData.length || 0,
  //     icon: <Users className="h-4 w-4 xl:h-7 xl:w-7 text-pink-700" />,
  //   },
  //   {
  //     title: 'Total Revenue',
  //     value: vehiclesData.length || 0,
  //     icon: <Truck className="h-4 w-4 xl:h-7 xl:w-7 text-orange-500" />,
  //   },
  //   {
  //     title: 'Total Trips',
  //     value: 0,
  //     icon: <Route className="h-4 w-4 xl:h-7 xl:w-7 text-emerald-500" />,
  //   },
  // ]

  // const users_tats = [
  //   {
  //     title: 'Total Users',
  //     value: usersData.length || 0,
  //     icon: <Users className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Admins',
  //     value:
  //       usersData.filter(
  //         (user) => user.role === 'admin' || user.role === 'superAdmin'
  //       )?.length || 0,
  //     icon: <ShieldCheck className="h-4 w-4 xl:h-7 xl:w-7 text-violet-500" />,
  //   },
  //   {
  //     title: 'Managers',
  //     value: usersData.filter((user) => user.role === 'manager')?.length || 0,
  //     icon: <ShieldAlert className="h-4 w-4 xl:h-7 xl:w-7 text-blue-500" />,
  //   },
  //   {
  //     title: 'Other',
  //     value:
  //       usersData.filter(
  //         (user) =>
  //           user.role !== 'admin' &&
  //           user.role !== 'superAdmin' &&
  //           user.role !== 'manager'
  //       )?.length || 0,
  //     icon: <ShieldAlert className="h-4 w-4 xl:h-7 xl:w-7 text-green-500 " />,
  //   },
  // ]

  // const vehicle_stats = [
  //   {
  //     title: 'Total Vehicles',
  //     value: vehiclesData.length || 0,
  //     icon: <Truck className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Available',
  //     value: vehiclesData.filter((v) => v.status == 'available')?.length || 0,
  //     icon: <CheckCircle className="h-4 w-4 xl:h-7 xl:w-7 text-green-500" />,
  //   },
  //   {
  //     title: 'In Use',
  //     value: vehiclesData.filter((v) => v.status == 'in-use')?.length || 0,
  //     icon: <Truck className="h-4 w-4 xl:h-7 xl:w-7 text-blue-500" />,
  //   },
  //   {
  //     title: 'In Maintenance',
  //     value: vehiclesData.filter((v) => v.status == 'maintenance')?.length || 0,
  //     icon: <Wrench className="h-4 w-4 xl:h-7 xl:w-7 text-amber-500" />,
  //   },
  // ]

  // const drivers_stats = [
  //   {
  //     title: 'Total Drivers',
  //     value: driversData.length || 0,
  //     icon: <UserCircle className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Available',
  //     value: driversData.filter((d) => d.status == 'available')?.length || 0,
  //     icon: <CheckCircle className="h-4 w-4 xl:h-7 xl:w-7 text-green-500" />,
  //   },
  //   {
  //     title: 'On A Trip',
  //     value: driversData.filter((d) => d.status == 'on-trip')?.length || 0,
  //     icon: <Truck className="h-4 w-4 xl:h-7 xl:w-7 text-blue-500" />,
  //   },
  //   {
  //     title: 'Inactive',
  //     value:
  //       driversData.filter(
  //         (d) => d.status !== 'on-trip' && d.status !== 'available'
  //       )?.length || 0,
  //     icon: <ShieldAlert className="h-4 w-4 xl:h-7 xl:w-7 text-red-500" />,
  //   },
  // ]

  // const StopPoint_stats = [
  //   {
  //     title: 'Total Stop Points',
  //     value: stopPointsData.length || 0,
  //     icon: <Map className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Warehouses',
  //     value:
  //       stopPointsData.filter((sp) => sp.status == 'warehouse')?.length || 0,
  //     icon: <MapPin className="h-4 w-4 xl:h-7 xl:w-7 text-amber-500" />,
  //   },
  //   {
  //     title: 'Distribution Centers',
  //     value:
  //       stopPointsData.filter((sp) => sp.status == 'checkpoint')?.length || 0,
  //     icon: <MapPin className="h-4 w-4 xl:h-7 xl:w-7 text-amber-500" />,
  //   },
  //   {
  //     title: 'Truck Stops',
  //     value:
  //       stopPointsData.filter((sp) => sp.status == 'truck-top')?.length || 0,
  //     icon: <MapPin className="h-4 w-4 xl:h-7 xl:w-7 text-amber-500" />,
  //   },
  // ]

  // const trips_stats = [
  //   {
  //     title: 'Total Trips',
  //     value: trips.data.length || 0,
  //     icon: <Route className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Scheduled Trips',
  //     value: trips.data.filter((t) => t.status == 'pending')?.length || 0,
  //     icon: <Route className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Active Trips',
  //     value: trips.data.filter((t) => t.status == 'active')?.length || 0,
  //     icon: <Route className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  //   {
  //     title: 'Completed Trips',
  //     value: trips.data.filter((t) => t.status == 'completed')?.length || 0,
  //     icon: <Route className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  //   },
  // ]

  const costCentres = cost_centres?.data || []

  const active_trips = trips?.data?.filter((t) => {
    if (dashboardState?.costCentre == 'All') {
      return t.status == 'in-progress'
    } else {
      return (
        t.costCentre == dashboardState?.costCentre && t.status == 'in-progress'
      )
    }
  })

  const active_vehicles = vehicles?.data?.filter((v) => {
    if (dashboardState.costCentre == 'All') {
      return v.status == 'on-trip'
    } else {
      const vCC = costCentres?.filter((cc) => cc.name == v.costCentre)?.[0]?.id
      return vCC == dashboardState.costCentre && v.status == 'on-trip'
    }
  })

  const active_drivers = drivers?.data?.filter((d) => {
    if (dashboardState.costCentre == 'All') {
      return d.status == 'on-trip'
    } else {
      const dCC = costCentres?.filter((cc) => cc.name == d.costCentre)?.[0]?.id
      return dCC == dashboardState.costCentre && d.status == 'on-trip'
    }
  })

  // const dashboard_stats = [
  //   {
  //     name: 'Active Trips',
  //     value: active_trips?.length || 0, //trips.screenStats.inProgress,
  //     icon: Map,
  //     color: 'text-blue-500',
  //     href: '/trips',
  //   },
  //   {
  //     name: 'Active Vehicles',
  //     value: active_vehicles?.length || 0, //vehicles.screenStats.available,
  //     icon: Truck,
  //     color: 'text-green-500',
  //     href: '/vehicles',
  //   },
  //   {
  //     name: 'Active Drivers',
  //     value: active_drivers.length || 0, //drivers.screenStats.active,
  //     icon: User,
  //     color: 'text-purple-500',
  //     href: '/drivers',
  //   },
  //   {
  //     name: 'Stop Points',
  //     value: stop_points?.data.length || 0, //stop_points.screenStats.total,
  //     icon: MapPin,
  //     color: 'text-amber-500',
  //     href: '/stop-points',
  //   },
  //   {
  //     name: 'Cost Centres',
  //     value: costCentres?.length || 0, //cost_centres.screenStats.total,
  //     icon: Building,
  //     color: 'text-indigo-500',
  //     href: '/cost-centres',
  //   },
  // ]

  return (
    <GlobalContext.Provider
      value={{
        modalOpen,
        setModalOpen,
        alertOpen,
        setAlertOpen,
        onCreate: onCreate(setModalOpen, modalOpen, setHref),
        onEdit: onEdit(setModalOpen, modalOpen, setId),
        onDelete: onDelete(setAlertOpen, alertOpen, setId),
        routes,
        downloadCSVFromTable,
        dashboardState,
        handleDashboardState,
        // dashboard_stats,
        cost_centres,
        costCentresDispatch,
        cc_api,
        clients,
        clientsDispatch,
        c_api,
        dashboard,
        dashboardDispatch,
        drivers,
        driversDispatch,
        d_api,
        stop_points,
        stopPointsDispatch,
        sp_api,
        trips,
        tripsDispatch,
        t_api,
        initialTripsState,
        users,
        usersDispatch,
        u_api,
        vehicles,
        vehiclesDispatch,
        v_api,
      }}
    >
      {children}
  {/* Dev inspector: shows raw context data from Supabase for quick debugging */}
      {/* <div style={{ position: 'fixed', right: 8, bottom: 8, zIndex: 9999 }}>
        <details style={{ maxWidth: 420, maxHeight: 360, overflow: 'auto', background: 'rgba(255,255,255,0.95)', padding: 8, borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Dev: Context Inspector</summary>
          <div style={{ fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            <div>
              <strong>cost_centres</strong>
              <pre>{JSON.stringify(cost_centres?.data || [], null, 2)}</pre>
            </div>
            <div>
              <strong>clients</strong>
              <pre>{JSON.stringify(clients?.data || [], null, 2)}</pre>
            </div>
            <div>
              <strong>trips</strong>
              <pre>{JSON.stringify(trips?.data || [], null, 2)}</pre>
            </div>
            <div>
              <strong>drivers</strong>
              <pre>{JSON.stringify(drivers?.data || [], null, 2)}</pre>
            </div>
            <div>
              <strong>vehicles</strong>
              <pre>{JSON.stringify(vehicles?.data || [], null, 2)}</pre>
            </div>
            <div>
              <strong>stop_points</strong>
              <pre>{JSON.stringify(stop_points?.data || [], null, 2)}</pre>
            </div>
            <div>
              <strong>users</strong>
              <pre>{JSON.stringify(users?.data || [], null, 2)}</pre>
            </div>
          </div>
        </details>
      </div> */}
  {/* compact data viewer on the left for quick glance */}
  {/* <DataViewer /> */}
      <AlertScreen
        alertOpen={alertOpen}
        setAlertOpen={setAlertOpen}
        id={id}
        // screen={screen}
      />

      <DialogScreen
        open={modalOpen}
        onOpenChange={setModalOpen}
        // screen={screen}
        id={id}
        href={href}
      />
    </GlobalContext.Provider>
  )
}

export default GlobalProvider

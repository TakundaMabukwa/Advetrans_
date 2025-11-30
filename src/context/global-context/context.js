'use client'
import { createContext, useContext } from 'react'
import { initialCostCentresState } from '@/context/cost-centres-context/context'
import { initialDashboardState } from '@/context/dashboard-context/context'
import { initialDriversState } from '@/context/drivers-context/context'
import { initialStopPointsState } from '@/context/stop-points-context/context'
import { initialTripsState } from '@/context/trips-context/context'
import { initialUserState } from '@/context/auth-context/context'
import { initialVehiclesState } from '@/context/vehicles-context/context'

export const initialState = {
  initialCostCentresState,
  initialDashboardState,
  initialDriversState,
  initialStopPointsState,
  initialTripsState,
  initialUserState,
  initialVehiclesState,
}

export const GlobalContext = createContext(initialState)

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  return context
}

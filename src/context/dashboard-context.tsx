"use client"

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { 
  DriverPerformance, 
  BiWeeklyCategory, 
  DailyViolation, 
  DriverReward, 
  DailyStats,
  epsApi,
  processDriverPerformance,
  processBiWeeklyData,
  processDailyViolations
} from '@/lib/eps-api'
import { getDrivers, EpsDriver, DriversResponse } from '@/lib/action/drivers'
import { toast } from 'sonner'

// Types for the context
interface DashboardState {
  driverPerformance: DriverPerformance[]
  biWeeklyData: BiWeeklyCategory[]
  dailyViolations: DailyViolation[]
  driverRewards: DriverReward[]
  dailyStats: DailyStats[]
  drivers: DriversResponse | null
  loading: {
    performance: boolean
    biWeekly: boolean
    violations: boolean
    rewards: boolean
    dailyStats: boolean
    drivers: boolean
  }
  errors: {
    performance: string
    biWeekly: string
    violations: string
    rewards: string
    dailyStats: string
    drivers: string
  }
  lastUpdated: {
    performance: number | null
    biWeekly: number | null
    violations: number | null
    rewards: number | null
    dailyStats: number | null
    drivers: number | null
  }
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: { key: keyof DashboardState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof DashboardState['errors']; value: string } }
  | { type: 'SET_DRIVER_PERFORMANCE'; payload: DriverPerformance[] }
  | { type: 'SET_BIWEEKLY_DATA'; payload: BiWeeklyCategory[] }
  | { type: 'SET_DAILY_VIOLATIONS'; payload: DailyViolation[] }
  | { type: 'SET_DRIVER_REWARDS'; payload: DriverReward[] }
  | { type: 'SET_DAILY_STATS'; payload: DailyStats[] }
  | { type: 'SET_DRIVERS'; payload: DriversResponse }
  | { type: 'SET_LAST_UPDATED'; payload: { key: keyof DashboardState['lastUpdated']; value: number } }

// Initial state
const initialState: DashboardState = {
  driverPerformance: [],
  biWeeklyData: [],
  dailyViolations: [],
  driverRewards: [],
  dailyStats: [],
  drivers: null,
  loading: {
    performance: false,
    biWeekly: false,
    violations: false,
    rewards: false,
    dailyStats: false,
    drivers: false,
  },
  errors: {
    performance: '',
    biWeekly: '',
    violations: '',
    rewards: '',
    dailyStats: '',
    drivers: '',
  },
  lastUpdated: {
    performance: null,
    biWeekly: null,
    violations: null,
    rewards: null,
    dailyStats: null,
    drivers: null,
  },
}

// Reducer function
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      }
    case 'SET_DRIVER_PERFORMANCE':
      return {
        ...state,
        driverPerformance: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          performance: Date.now(),
        },
      }
    case 'SET_BIWEEKLY_DATA':
      return {
        ...state,
        biWeeklyData: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          biWeekly: Date.now(),
        },
      }
    case 'SET_DAILY_VIOLATIONS':
      return {
        ...state,
        dailyViolations: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          violations: Date.now(),
        },
      }
    case 'SET_DRIVER_REWARDS':
      return {
        ...state,
        driverRewards: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          rewards: Date.now(),
        },
      }
    case 'SET_DAILY_STATS':
      return {
        ...state,
        dailyStats: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          dailyStats: Date.now(),
        },
      }
    case 'SET_DRIVERS':
      return {
        ...state,
        drivers: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          drivers: Date.now(),
        },
      }
    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: {
          ...state.lastUpdated,
          [action.payload.key]: action.payload.value,
        },
      }
    default:
      return state
  }
}

// Context
const DashboardContext = createContext<{
  state: DashboardState
  dispatch: React.Dispatch<DashboardAction>
  fetchDriverPerformance: () => Promise<void>
  fetchBiWeeklyData: () => Promise<void>
  fetchDailyViolations: () => Promise<void>
  fetchDriverRewards: () => Promise<void>
  fetchDailyStats: () => Promise<void>
  fetchDrivers: (page?: number, limit?: number, search?: string) => Promise<void>
  refreshAllData: () => Promise<void>
  isDataStale: (key: keyof DashboardState['lastUpdated']) => boolean
} | null>(null)

// Data comparison utilities
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (let key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }
    return true
  }
  
  return false
}

// Provider component
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  // Check if data exists (no automatic refresh)
  const isDataStale = useCallback((key: keyof DashboardState['lastUpdated']): boolean => {
    const lastUpdated = state.lastUpdated[key]
    return !lastUpdated // Only fetch if data doesn't exist
  }, [state.lastUpdated])

  // Fetch functions with data comparison
  const fetchDriverPerformance = useCallback(async () => {
    if (!isDataStale('performance')) {
      console.log('📊 Driver Performance data is fresh, skipping fetch')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'performance', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'performance', value: '' } })

    try {
      const data = await epsApi.getDriverPerformance()
      console.log('🚗 Driver Performance Data:', data)
      
      const processedData = processDriverPerformance(data)
      console.log('📊 Processed Driver Performance:', processedData)
      
      // Compare with existing data
      if (!deepEqual(state.driverPerformance, processedData)) {
        dispatch({ type: 'SET_DRIVER_PERFORMANCE', payload: processedData })
        console.log('✅ Driver Performance data updated')
      } else {
        console.log('📊 Driver Performance data unchanged, skipping update')
        dispatch({ type: 'SET_LAST_UPDATED', payload: { key: 'performance', value: Date.now() } })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch driver performance'
      console.error('❌ Driver Performance Error:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'performance', value: errorMessage } })
      toast.error(`Error loading driver performance: ${errorMessage}`)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'performance', value: false } })
    }
  }, [state.driverPerformance, isDataStale])

  const fetchBiWeeklyData = useCallback(async () => {
    if (!isDataStale('biWeekly')) {
      console.log('📊 Bi-Weekly data is fresh, skipping fetch')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'biWeekly', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'biWeekly', value: '' } })

    try {
      const data = await epsApi.getBiWeeklyCategories()
      console.log('📅 Bi-Weekly Data:', data)
      
      const processedData = processBiWeeklyData(data)
      console.log('📊 Processed Bi-Weekly Data:', processedData)
      
      if (!deepEqual(state.biWeeklyData, processedData)) {
        dispatch({ type: 'SET_BIWEEKLY_DATA', payload: processedData })
        console.log('✅ Bi-Weekly data updated')
      } else {
        console.log('📊 Bi-Weekly data unchanged, skipping update')
        dispatch({ type: 'SET_LAST_UPDATED', payload: { key: 'biWeekly', value: Date.now() } })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bi-weekly data'
      console.error('❌ Bi-Weekly Error:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'biWeekly', value: errorMessage } })
      toast.error(`Error loading bi-weekly data: ${errorMessage}`)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'biWeekly', value: false } })
    }
  }, [state.biWeeklyData, isDataStale])

  const fetchDailyViolations = useCallback(async () => {
    if (!isDataStale('violations')) {
      console.log('📊 Daily Violations data is fresh, skipping fetch')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'violations', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'violations', value: '' } })

    try {
      const data = await epsApi.getDailyViolations()
      console.log('⚠️ Daily Violations Data:', data)
      
      const processedData = processDailyViolations(data)
      console.log('📊 Processed Daily Violations:', processedData)
      
      if (!deepEqual(state.dailyViolations, processedData)) {
        dispatch({ type: 'SET_DAILY_VIOLATIONS', payload: processedData })
        console.log('✅ Daily Violations data updated')
      } else {
        console.log('📊 Daily Violations data unchanged, skipping update')
        dispatch({ type: 'SET_LAST_UPDATED', payload: { key: 'violations', value: Date.now() } })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch daily violations'
      console.error('❌ Daily Violations Error:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'violations', value: errorMessage } })
      toast.error(`Error loading daily violations: ${errorMessage}`)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'violations', value: false } })
    }
  }, [state.dailyViolations, isDataStale])

  const fetchDriverRewards = useCallback(async () => {
    if (!isDataStale('rewards')) {
      console.log('📊 Driver Rewards data is fresh, skipping fetch')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'rewards', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'rewards', value: '' } })

    try {
      const data = await epsApi.getDriverRewards()
      console.log('🏆 Driver Rewards Data:', data)
      
      if (!deepEqual(state.driverRewards, data)) {
        dispatch({ type: 'SET_DRIVER_REWARDS', payload: data })
        console.log('✅ Driver Rewards data updated')
      } else {
        console.log('📊 Driver Rewards data unchanged, skipping update')
        dispatch({ type: 'SET_LAST_UPDATED', payload: { key: 'rewards', value: Date.now() } })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch driver rewards'
      console.error('❌ Driver Rewards Error:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'rewards', value: errorMessage } })
      toast.error(`Error loading driver rewards: ${errorMessage}`)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'rewards', value: false } })
    }
  }, [state.driverRewards, isDataStale])

  const fetchDailyStats = useCallback(async () => {
    if (!isDataStale('dailyStats')) {
      console.log('📊 Daily Stats data is fresh, skipping fetch')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'dailyStats', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'dailyStats', value: '' } })

    try {
      const data = await epsApi.getDailyStats()
      console.log('📈 Daily Stats Data:', data)
      
      if (!deepEqual(state.dailyStats, data)) {
        dispatch({ type: 'SET_DAILY_STATS', payload: data })
        console.log('✅ Daily Stats data updated')
      } else {
        console.log('📊 Daily Stats data unchanged, skipping update')
        dispatch({ type: 'SET_LAST_UPDATED', payload: { key: 'dailyStats', value: Date.now() } })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch daily stats'
      console.error('❌ Daily Stats Error:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'dailyStats', value: errorMessage } })
      toast.error(`Error loading daily stats: ${errorMessage}`)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'dailyStats', value: false } })
    }
  }, [state.dailyStats, isDataStale])

  const fetchDrivers = useCallback(async (page: number = 1, limit: number = 20, search?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'drivers', value: true } })
    dispatch({ type: 'SET_ERROR', payload: { key: 'drivers', value: '' } })

    try {
      const data = await getDrivers(page, limit, search)
      console.log('👥 Drivers Data:', data)
      
      dispatch({ type: 'SET_DRIVERS', payload: data })
      console.log('✅ Drivers data updated')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch drivers'
      console.error('❌ Drivers Error:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'drivers', value: errorMessage } })
      toast.error(`Error loading drivers: ${errorMessage}`)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'drivers', value: false } })
    }
  }, [])

  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all dashboard data...')
    await Promise.all([
      fetchDriverPerformance(),
      fetchBiWeeklyData(),
      fetchDailyViolations(),
      fetchDriverRewards(),
      fetchDailyStats(),
    ])
    console.log('✅ All dashboard data refreshed')
  }, [fetchDriverPerformance, fetchBiWeeklyData, fetchDailyViolations, fetchDriverRewards, fetchDailyStats])

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    fetchDriverPerformance,
    fetchBiWeeklyData,
    fetchDailyViolations,
    fetchDriverRewards,
    fetchDailyStats,
    fetchDrivers,
    refreshAllData,
    isDataStale,
  }), [
    state,
    fetchDriverPerformance,
    fetchBiWeeklyData,
    fetchDailyViolations,
    fetchDriverRewards,
    fetchDailyStats,
    fetchDrivers,
    refreshAllData,
    isDataStale,
  ])

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

// Hook to use the dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

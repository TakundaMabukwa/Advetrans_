// EPS Reward System API Service
const BASE_URL = 'http://64.227.138.235:3000/api/eps-rewards'

// Types for EPS API responses
export interface BiWeeklyCategoryPoints {
  period: {
    start: string
    end: string
  }
  haulType: 'Long Haul' | 'Medium Haul' | 'Short Haul'
  caps: {
    speedCompliance: number
    harshBraking: number
    dayDriving: number
    nightDriving: number
  }
  earned: {
    speedCompliance: number
    harshBraking: number
    dayDriving: number
    nightDriving: number
    total: number
  }
  remaining: {
    speedCompliance: number
    harshBraking: number
    dayDriving: number
    nightDriving: number
  }
}

export interface DriverPerformance {
  plate: string
  driver_name: string
  latest_speed: number
  latest_latitude: number
  latest_longitude: number
  latest_loc_time: string
  latest_mileage: number
  latest_geozone: string
  latest_address: string
  speed_compliance: boolean
  route_compliance: boolean
  time_compliance: boolean
  efficiency: number
  safety_score: number
  total_points: number
  reward_level: 'Rookie' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  total_updates_count: number
  last_update_time: string
  biWeeklyCategoryPoints?: BiWeeklyCategoryPoints
}

export interface BiWeeklyCategory {
  plate: string
  driver_name: string
  bi_weekly_distance: number
  haul_category: 'Long Haul' | 'Medium Haul' | 'Short Haul'
  total_points: number
  total_violations: number
  speed_violations: number
  route_violations: number
  night_driving_violations: number
  days_active: number
  penalty_percentage: number
  penalty_capped: 'YES' | 'NO'
  biWeeklyCategoryPoints?: {
    haulType: 'Long Haul' | 'Medium Haul' | 'Short Haul'
    totalEarned: number
    caps: {
      speedCompliance: number
      harshBraking: number
      dayDriving: number
      nightDriving: number
    }
    earned: {
      speedCompliance: number
      harshBraking: number
      dayDriving: number
      nightDriving: number
    }
  }
}

export interface PenaltyCapDetails {
  driverName: string
  plate: string
  haulCategory: string
  totalViolations: number
  violationBreakdown: {
    speed: number
    route: number
    nightDriving: number
  }
  penaltyCalculation: {
    calculatedPenaltyPoints: number
    cappedPenaltyPoints: number
    penaltyCapped: boolean
    cappedAmount: number
  }
}

export interface DailyViolation {
  plate: string
  driver_name: string
  date: string
  speeding_count: number
  harsh_braking_count: number
  excessive_day_count: number
  excessive_night_count: number
  route_deviation_count: number
  total_violations: number
  total_penalty_points: number
  last_violation_time: string
  created_at: string
}

export interface DriverReward {
  plate: string
  driver_name: string
  reward_type: string
  points: number
  current_level: string
  violations_count: number
  total_points: number
  last_updated: string
  created_at: string
}

export interface DailyStats {
  plate: string
  driver_name: string
  date: string
  total_distance: number
  daily_distance: number
  total_violations: number
  total_points: number
  speed_violations: number
  route_violations: number
  night_driving_violations: number
  first_drive_time: string
  last_drive_time: string
  total_driving_hours: number
  day_driving_hours: number
  night_driving_hours: number
  created_at: string
}

export interface EpsDriver {
  id: string
  new_account_number: string
  first_name: string
  surname: string
  identification_number: string | null
  identification_document_url: string | null
  email_address: string | null
  cell_number: string | null
  sa_issued: boolean | null
  work_permit_url: string | null
  license_number: string | null
  license_expiry_date: string | null
  license_code: string | null
  driver_restriction_code: string | null
  vehicle_restriction_code: string | null
  license_front_url: string | null
  license_rear_url: string | null
  professional_driving_permit: boolean | null
  pdp_expiry_date: string | null
  driver_status: string | null
  managed_code: string | null
  address: string | null
  cellular: string | null
  additional_info: string | null
  eps_validation: boolean | null
  created_at: string
  updated_at: string
  is_active: boolean | null
  code: string | null
}

export interface DriversResponse {
  drivers: EpsDriver[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SystemHealth {
  success: boolean
  message: string
}

// API Service Class
export class EPSApiService {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Generic fetch method with error handling
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error)
      throw error
    }
  }

  // System Health & Testing
  async testConnection(): Promise<SystemHealth> {
    return this.fetchData<SystemHealth>('/test')
  }

  // Driver Performance Data
  async getDriverPerformance(): Promise<DriverPerformance[]> {
    return this.fetchData<DriverPerformance[]>('/performance')
  }

  // Bi-Weekly Categories & Penalty Analysis
  async getBiWeeklyCategories(): Promise<BiWeeklyCategory[]> {
    return this.fetchData<BiWeeklyCategory[]>('/bi-weekly-categories')
  }

  // Individual Driver Penalty Details
  async getPenaltyCapDetails(driverName: string): Promise<PenaltyCapDetails> {
    const encodedName = encodeURIComponent(driverName)
    return this.fetchData<PenaltyCapDetails>(`/penalty-cap/${encodedName}`)
  }

  // Daily Violations Summary
  async getDailyViolations(): Promise<DailyViolation[]> {
    return this.fetchData<DailyViolation[]>('/violations')
  }

  // Driver Rewards Summary
  async getDriverRewards(): Promise<DriverReward[]> {
    return this.fetchData<DriverReward[]>('/rewards')
  }

  // Daily Driving Statistics
  async getDailyStats(): Promise<DailyStats[]> {
    return this.fetchData<DailyStats[]>('/daily-stats')
  }
}

// Create a singleton instance
export const epsApi = new EPSApiService()

// Utility functions for data processing
export const processDriverPerformance = (data: DriverPerformance[]) => {
  return data.map(driver => ({
    ...driver,
    // Calculate performance score based on compliance and scores
    performanceScore: Math.round(
      ((driver.speed_compliance ? 25 : 0) +
       (driver.route_compliance ? 25 : 0) +
       (driver.time_compliance ? 25 : 0) +
       (driver.efficiency * 25)) * 100
    ) / 100,
    // Determine if performing well
    isPerformingWell: driver.safety_score >= 0.7 && driver.efficiency >= 0.7,
    // Format reward level with color
    rewardLevelColor: getRewardLevelColor(driver.reward_level)
  }))
}

export const processBiWeeklyData = (data: BiWeeklyCategory[]) => {
  return data.map(driver => ({
    ...driver,
    // Calculate penalty severity
    penaltySeverity: driver.penalty_percentage >= 80 ? 'High' : 
                    driver.penalty_percentage >= 50 ? 'Medium' : 'Low',
    // Format haul category with color
    haulCategoryColor: getHaulCategoryColor(driver.haul_category)
  }))
}

export const processDailyViolations = (data: DailyViolation[]) => {
  return data.map(violation => ({
    ...violation,
    // Calculate violation severity
    violationSeverity: violation.total_violations >= 10 ? 'High' :
                      violation.total_violations >= 5 ? 'Medium' : 'Low',
    // Format violation count with color
    violationColor: getViolationColor(violation.total_violations)
  }))
}

// Helper functions for colors and formatting
const getRewardLevelColor = (level: string) => {
  const colors = {
    'Rookie': 'bg-gray-100 text-gray-800',
    'Bronze': 'bg-orange-100 text-orange-800',
    'Silver': 'bg-gray-100 text-gray-800',
    'Gold': 'bg-yellow-100 text-yellow-800',
    'Platinum': 'bg-purple-100 text-purple-800'
  }
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getHaulCategoryColor = (category: string) => {
  const colors = {
    'Long Haul': 'bg-blue-100 text-blue-800',
    'Medium Haul': 'bg-green-100 text-green-800',
    'Short Haul': 'bg-yellow-100 text-yellow-800'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getViolationColor = (count: number) => {
  if (count >= 10) return 'bg-red-100 text-red-800'
  if (count >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

// Data refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  PERFORMANCE: 30000,    // 30 seconds for real-time data
  DAILY_STATS: 300000,   // 5 minutes for daily summaries
  BI_WEEKLY: 3600000,    // 1 hour for bi-weekly reports
  VIOLATIONS: 300000,    // 5 minutes for violations
  REWARDS: 300000,       // 5 minutes for rewards
  PENALTY_CAP: 0         // On-demand only
} as const

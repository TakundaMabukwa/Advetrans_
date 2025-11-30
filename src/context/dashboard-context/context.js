'use client'

// icons
import { Building2, UserCircle, Truck, MapPin } from 'lucide-react'

const titleSection = {
  title: 'Dashboard',
  description: 'Overview of your fleet management operations',
}

const dashboardStats = [
  {
    title: 'Active Trips',
    value: 24,
    icon: <MapPin className="h-4 w-4 text-amber-500" />,
    total: 36,
  },
  {
    title: 'Available Vehicles',
    value: 48,
    icon: <Truck className="h-4 w-4 text-orange-500" />,
    total: 62,
  },
  {
    title: 'Available Drivers',
    value: 36,
    icon: <UserCircle className="h-4 w-4 text-green-700" />,
    total: 42,
  },
  {
    title: 'Cost Centres',
    value: 8,
    icon: <Building2 className="h-4 w-4 text-violet-500" />,
  },
]

export const initialDashboardState = {
  titleSection,
  dashboardStats,
  loading: false,
  error: null,
}

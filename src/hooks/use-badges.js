// icons
import {
  AlertTriangle,
  UserCircle,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Clock,
  Play,
  CheckCircle,
  Truck,
  Wrench,
  Users,
} from 'lucide-react'

// components
import { Badge } from '@/components/ui/badge'

// Function to get driver status badge
export const getDriverStatusBadge = (status) => {
  switch (status) {
    case 'available':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Available
        </Badge>
      )
    case 'in-use':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Truck className="h-3 w-3 mr-1" /> In Use
        </Badge>
      )
    case 'maintenance':
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800"
        >
          <Wrench className="h-3 w-3 mr-1" /> Maintenance
        </Badge>
      )
    case 'inactive':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" /> Inactive
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

// Function to get stop points type badge
export const getStopPointBadgeType = (type) => {
  switch (type) {
    case 'warehouse':
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
        >
          Warehouse
        </Badge>
      )
    case 'distribution':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
        >
          Distribution
        </Badge>
      )
    case 'hub':
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800"
        >
          Hub
        </Badge>
      )
    case 'loading':
      return (
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800"
        >
          Loading
        </Badge>
      )
    case 'transit':
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800"
        >
          Transit
        </Badge>
      )
    default:
      return <Badge>{type}</Badge>
  }
}

// Function to get trips status badge
export const getTripStatusBadge = (status) => {
  switch (status) {
    case 'scheduled':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
        >
          <Clock className="h-3 w-3 mr-1" /> Scheduled
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Play className="h-3 w-3 mr-1" /> In Progress
        </Badge>
      )
    case 'delayed':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" /> Delayed
        </Badge>
      )
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Completed
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

// Function to get user role badge
export const getUserRoleBadge = (role) => {
  switch (role) {
    case 'admin':
      return (
        <Badge className="bg-violet-500 hover:bg-violet-600">
          <ShieldCheck className="h-3 w-3 mr-1" /> Admin
        </Badge>
      )
    case 'manager':
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
        >
          <ShieldAlert className="h-3 w-3 mr-1" /> Manager
        </Badge>
      )
    case 'user':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
        >
          <Users className="h-3 w-3 mr-1" /> User
        </Badge>
      )
    default:
      return <Badge>{role}</Badge>
  }
}

// Function to get vehicle status badge
export const getVehicleStatusBadge = (status) => {
  switch (status) {
    case 'available':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3 mr-1" /> Available
        </Badge>
      )
    case 'in-use':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Truck className="h-3 w-3 mr-1" /> In Use
        </Badge>
      )
    case 'maintenance':
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800"
        >
          <Wrench className="h-3 w-3 mr-1" /> Maintenance
        </Badge>
      )
    case 'inactive':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" /> Inactive
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

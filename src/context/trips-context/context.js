// icons
import { Plus, Clock, Play, AlertTriangle, CheckCircle } from 'lucide-react'

// components
import {
  createActionsColumn,
  createCheckboxColumn,
  createSortableHeader,
} from '@/components/ui/data-table'

// hooks
import { getTripStatusBadge } from '@/hooks/use-badges'

const titleSection = {
  title: 'Trips',
  description: 'Manage your fleet trips and routes',
  button: {
    text: 'Add Trip',
    icon: <Plus className="mr-2 h-4 w-4" />,
  },
}

const screenStats = [
  {
    title: 'Total Trips',
    value: 91,
    icon: <Clock className="h-4 w-4 xl:h-7 xl:w-7 text-gray-500" />,
  },
  {
    title: 'In Progress',
    value: 24,
    icon: <Play className="h-4 w-4 xl:h-7 xl:w-7 text-blue-500" />,
  },
  {
    title: 'Delayed',
    value: 39,
    icon: <AlertTriangle className="h-4 w-4 xl:h-7 xl:w-7 text-red-500" />,
  },
  {
    title: 'Completed',
    value: 42,
    icon: <CheckCircle className="h-4 w-4 xl:h-7 xl:w-7 text-green-500" />,
  },
]

const tableInfo = {
  tabs: [
    {
      value: 'all',
      title: 'All Trips',
      filterColumn: 'trip_id',
      filterPlaceholder: 'Search trips...',
    },
    {
      value: 'pending',
      title: 'Scheduled',
      filterColumn: 'status',
      filterBy: 'pending',
      filterPlaceholder: 'Search scheduled trips...',
    },
    {
      value: 'active',
      title: 'Active',
      filterColumn: 'status',
      filterBy: ['in-progress', 'delayed'],
      filterPlaceholder: 'Search active trips...',
    },
    {
      value: 'completed',
      title: 'Completed',
      filterColumn: 'status',
      filterBy: 'completed',
      filterPlaceholder: 'Search completed trips...',
    },
  ],
}

const columns = () => [
  createCheckboxColumn(),
  {
    accessorKey: 'trip_id',
    header: createSortableHeader('Trip ID'),
    cell: ({ row }) => <div>{row.getValue('trip_id')}</div>,
  },
  {
    accessorKey: 'orderNumber',
    header: createSortableHeader('Order #'),
  },
  {
    accessorKey: 'cost_centre',
    header: createSortableHeader('Cost Centre'),
  },
  {
    accessorKey: 'selectedClient',
    header: createSortableHeader('Client'),
    cell: ({ row }) => {
      // Prefer clientDetails.name if available
      return <div>{row.original.clientDetails?.name || row.original.selectedClient}</div>
    },
  },
  {
    accessorKey: 'origin',
    header: createSortableHeader('Origin'),
  },
  {
    accessorKey: 'destination',
    header: createSortableHeader('Destination'),
  },
  {
    accessorKey: 'cargo',
    header: createSortableHeader('Cargo'),
  },
  {
    accessorKey: 'cargo_weight',
    header: createSortableHeader('Cargo Weight'),
  },
  {
    accessorKey: 'vehicles',
    header: createSortableHeader('Vehicles'),
    cell: ({ row }) => {
      const vehicles = row.original.vehicles || row.original.vehicleAssignments || []
      return <div>{Array.isArray(vehicles) ? vehicles.length : 0}</div>
    },
  },
  {
    accessorKey: 'drivers',
    header: createSortableHeader('Drivers'),
    cell: ({ row }) => {
      const drivers = row.original.drivers || []
      return <div>{Array.isArray(drivers) ? drivers.length : 0}</div>
    },
  },
  {
    accessorKey: 'startDate',
    header: createSortableHeader('Start Date'),
  },
  {
    accessorKey: 'end_date',
    header: createSortableHeader('End Date'),
  },
  {
    accessorKey: 'status',
    header: createSortableHeader('Status'),
    cell: ({ row }) => getTripStatusBadge(row.getValue('status')),
  },
  {
    id: 'actions',
    header: 'actions',
    cell: ({ row }) => {
      const trip = row.original
      return createActionsColumn({ data: trip })
    },
  },
]

// data
const data = []

const headers = [
  'Trip ID',
  'Order #',
  'Cost Centre',
  'Client',
  'Origin',
  'Destination',
  'Cargo',
  'Cargo Weight',
  'Vehicles',
  'Drivers',
  'Start Date',
  'End Date',
  'Status',
]

const rows = (data) => {
  return data.map((item) => {
    const vehicles = Array.isArray(item.vehicles)
      ? item.vehicles.length
      : Array.isArray(item.vehicleAssignments)
      ? item.vehicleAssignments.length
      : 0
    const drivers = Array.isArray(item.drivers) ? item.drivers.length : 0

    return [
      item.trip_id || '',
      item.orderNumber || '',
      item.cost_centre || '',
      item.clientDetails?.name || item.selectedClient || '',
      item.origin || '',
      item.destination || '',
      item.cargo || '',
      item.cargo_weight || '',
      vehicles,
      drivers,
      item.startDate || '',
      item.end_date || '',
      item.status || '',
    ]
  })
}

export const initialTripsState = {
  csv_headers: headers,
  csv_rows: rows,
  titleSection,
  screenStats,
  tableInfo,
  columns: columns,
  data,
  loading: false,
  error: null,
}

// icons
import { Plus, Building2, Users, Truck, Route } from 'lucide-react'

// components
import { Badge } from '@/components/ui/badge'
import {
  createActionsColumn,
  createCheckboxColumn,
  createSortableHeader,
} from '@/components/ui/data-table'

// data
const data = []

// page title
const titleSection = {
  title: 'Cost Centres',
  description: "Manage your organization's cost centres",
  button: {
    text: 'Add Cost Centre',
    icon: <Plus className="mr-2 h-4 w-4" />,
  },
}

// stats
const screenStats = [
  {
    title: 'Total Cost Centres',
    value: 0,
    icon: <Building2 className="h-4 w-4 text-violet-500" />,
  },
  {
    title: 'Total Users',
    value: 0,
    icon: <Users className="h-4 w-4 text-pink-700" />,
  },
  {
    title: 'Total Vehicles',
    value: 0,
    icon: <Truck className="h-4 w-4 text-orange-500" />,
  },
  {
    title: 'Active Trips',
    value: 0,
    icon: <Route className="h-4 w-4 text-emerald-500" />,
  },
]

// table header
const tableInfo = {
  title: 'Cost Centres',
  filterColumn: 'name',
  filterPlaceholder: 'Filter cost centres...',
}

const columns = () => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('ID'),
    },
    {
      accessorKey: 'name',
      header: createSortableHeader('Name'),
    },
    {
      accessorKey: 'manager',
      header: createSortableHeader('Manager'),
    },
    {
      accessorKey: 'manager_email',
      header: createSortableHeader('Manager Email'),
    },
    {
      accessorKey: 'manager_phone',
      header: createSortableHeader('Manager Phone'),
    },
    {
      accessorKey: 'status',
      header: createSortableHeader('Status'),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800"
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'established',
      header: createSortableHeader('Established'),
    },
    {
      accessorKey: 'budget',
      header: createSortableHeader('Budget'),
    },
    {
      accessorKey: 'full_address',
      header: createSortableHeader('Full Address'),
    },
    {
      accessorKey: 'description',
      header: createSortableHeader('Description'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const costCentre = row.original
        return createActionsColumn({ data: costCentre })
      },
    },
  ]
}

const rows = (data) => {
  return data.map((item) => {
    return [
      item.id || '',
      item.name || '',
      item.manager || '',
      item.manager_email || '',
      item.manager_phone || '',
      item.status || '',
      item.established || '',
      item.budget != null ? item.budget : '',
      item.full_address || '',
      item.description || '',
    ]
  })
}

const headers = [
  'ID',
  'Name',
  'Manager',
  'Manager Email',
  'Manager Phone',
  'Status',
  'Established',
  'Budget',
  'Full Address',
  'Description',
]

// context
export const initialCostCentresState = {
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

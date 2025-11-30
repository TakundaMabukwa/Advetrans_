// icons
import { Plus, Building2, Users, Truck, Route, MapPin } from 'lucide-react'

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
  title: 'Clients',
  description: 'Manage your client relationships and track performance',
  button: {
    text: 'Add Client',
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
  title: 'Clients',
  filterColumn: 'name',
  filterPlaceholder: 'Filter clients...',
}

export const columns = () => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('ID'),
      cell: ({ row }) => (
        <div className="font-medium text-gray-500">{row.original.id}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: createSortableHeader('Client'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'contact_person',
      header: createSortableHeader('Contact Person'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('contact_person')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: createSortableHeader('Email'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: createSortableHeader('Phone'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('phone')}</div>
      ),
    },
    {
      accessorKey: 'industry',
      header: createSortableHeader('Industry'),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('industry')}</Badge>
      ),
    },
    {
      accessorKey: 'pickup_locations',
      header: createSortableHeader('Pickup Locations'),
      cell: ({ row }) => {
        const pickupCount = row.original.pickup_locations?.length || 0
        return (
          <Badge
            variant="outline"
            className="bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-800"
          >
            {pickupCount}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'dropoff_locations',
      header: createSortableHeader('Dropoff Locations'),
      cell: ({ row }) => {
        const dropoffCount = row.original.dropoff_locations?.length || 0
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
          >
            {dropoffCount}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'Active' ? 'default' : 'secondary'
          }
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'ck_number',
      header: createSortableHeader('CK Number'),
      cell: ({ row }) => <div>{row.getValue('ck_number')}</div>,
    },
    {
      accessorKey: 'tax_number',
      header: createSortableHeader('Tax Number'),
      cell: ({ row }) => <div>{row.getValue('tax_number')}</div>,
    },
    {
      accessorKey: 'vat_number',
      header: createSortableHeader('VAT Number'),
      cell: ({ row }) => <div>{row.getValue('vat_number')}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const client = row.original
        return createActionsColumn({ data: client })
      },
    },
  ]
}

export const fetchData = async () => {
  // fetch data from your API or database
  const { data, error } = await supabase.from('clients').select('*')
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  if (data) {
    // No mapping needed if you use snake_case in columns
    return data
  }
}

const headers = [
  'ID',
  'Client',
  'Contact Person',
  'Email',
  'Phone',
  'Pickup Locations',
  'Dropoff Locations',
  'Status',
  'CK Number',
  'Tax Number',
  'VAT Number',
]

const rows = (data) => {
  return data.map((item) => {
    const pickup = item.pickup_locations?.length || 0
    const dropoff = item.dropoff_locations?.length || 0

    return [
      item.id || '',
      item.name || '',
      item.contact_person || '',
      item.email || '',
      item.phone || '',
      item.industry || '',
      pickup,
      dropoff,
      item.status || '',
      item.ck_number || '',
      item.tax_number || '',
      item.vat_number || '',
    ]
  })
}

// context
export const initialClientState = {
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

// icons
import { UserCircle, ShieldCheck, ShieldAlert, Plus } from 'lucide-react'

// components

import {
  createActionsColumn,
  createCheckboxColumn,
  createSortableHeader,
} from '@/components/ui/data-table'

// hooks
import { getDriverStatusBadge } from '@/hooks/use-badges'

const titleSection = {
  title: 'Drivers',
  description: 'Manage your fleet drivers',
  button: {
    text: 'Add Driver',
    icon: <Plus className="mr-2 h-4 w-4" />,
  },
}

const screenStats = [
  {
    title: 'Total Drivers',
    value: 52,
    icon: <UserCircle className="h-4 w-4 text-gray-500" />,
  },
  {
    title: 'Admins',
    value: 3,
    icon: <ShieldCheck className="h-4 w-4 text-violet-500" />,
  },
  {
    title: 'Managers',
    value: 8,
    icon: <ShieldAlert className="h-4 w-4 text-blue-500" />,
  },
]

const tableInfo = {
  title: 'Drivers',
  filterColumn: 'name',
  filterPlaceholder: 'Search drivers...',
}

const columns = ({ onEdit, onDelete }) => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('ID'),
      // cell: ({ row }) => (
      //   <div className="font-medium">{row.getValue('id')}</div>
      // ),
    },
    {
      accessorKey: 'costCentre',
      header: createSortableHeader('Cost Centre'),
    },
    {
      accessorKey: 'name',
      header: createSortableHeader('Name'),
      // cell: ({ row }) => (
      //   <div>
      //     <div className="font-medium">{row.getValue('name')}</div>
      //     <div className="text-sm text-gray-500">{row.original.lastName}</div>
      //   </div>
      // ),
    },
    {
      accessorKey: 'phone',
      header: createSortableHeader('Contact'),
      // cell: ({ row }) => (
      //   <div>
      //     <div className="font-medium">{row.getValue('phone')}</div>
      //     <div className="text-sm text-gray-500">{row.original.email}</div>
      //   </div>
      // ),
    },
    {
      accessorKey: 'emergencyContact',
      header: createSortableHeader('Emergency Contact'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('emergencyContact')}</div>
          <div className="text-sm text-gray-500">
            {row.original.emergencyPhone}
          </div>
        </div>
      ),
    },
    // {
    //   accessorKey: 'license',
    //   header: createSortableHeader('License'),
    //   cell: ({ row }) => (
    //     <div>
    //       <div className="font-medium">{row.getValue('license')}</div>
    //       <div className="text-sm text-gray-500">
    //         {row.original.licenseCode} • Exp: {row.original.licenseExpiry}
    //       </div>
    //     </div>
    //   ),
    // },

    {
      accessorKey: 'status',
      header: createSortableHeader('Status'),
      cell: ({ row }) => getDriverStatusBadge(row.getValue('status')),
    },

    // {
    //   accessorKey: 'currentVehicle',
    //   header: createSortableHeader('Current Vehicle'),
    // },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const driver = row.original

        return createActionsColumn({ data: driver, onEdit, onDelete })
      },
    },
  ]
}

const data = []

const headers = [
  'ID',
  'Cost Centre',
  'Name',
  'Contact',
  'Emergency Contact',
  'Emergency Phone',
  'Status',
]

const rows = (data) => {
  return data.map((item) => [
    item.id || '',
    item.costCentre || '',
    item.name || '',
    item.phone || '',
    item.emergencyContact || '',
    item.emergencyPhone || '',
    item.status || '',
  ])
}

export const initialDriversState = {
  csv_headers: headers,
  csv_rows: rows,
  titleSection,
  tableInfo,
  screenStats,
  columns: columns,
  data,
  loading: false,
  error: null,
}

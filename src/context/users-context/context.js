// icons
import { Plus, Users, ShieldCheck, ShieldAlert } from 'lucide-react'

// components
import {
  createActionsColumn,
  createCheckboxColumn,
  createSortableHeader,
} from '@/components/ui/data-table'

// hooks
import { getUserRoleBadge } from '@/hooks/use-badges'

const titleSection = {
  title: 'Users',
  description: 'Manage system users and permissions',
  button: {
    text: 'Add User',
    icon: <Plus className="mr-2 h-4 w-4" />,
  },
}

const screenStats = [
  {
    title: 'Total Users',
    value: 52,
    icon: <Users className="h-4 w-4 text-gray-500" />,
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
  title: 'Users',
  filterColumn: 'name' || 'manager',
  filterPlaceholder: 'Search users...',
}

const columns = ({ onEdit, onDelete }) => {
  return [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('ID'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: createSortableHeader('Name'),
    },
    {
      accessorKey: 'email',
      header: createSortableHeader('Email'),
    },
    {
      accessorKey: 'role',
      header: createSortableHeader('Role'),
      cell: ({ row }) => getUserRoleBadge(row.getValue('role')),
    },
    {
      accessorKey: 'costCentre',
      header: createSortableHeader('Cost Centre'),
    },
    {
      accessorKey: 'lastLogin',
      header: createSortableHeader('Last Login'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original

        return createActionsColumn({ data: user, onEdit, onDelete })
      },
    },
  ]
}

// data
const data = []

const headers = ['ID', 'Name', 'Email', 'Role', 'Cost Centre', 'Last Login']

const rows = (data) => {
  return data.map((item) => [
    item.id || '',
    item.name || '',
    item.email || '',
    item.role || '',
    item.costCentre || '',
    item.lastLogin || '',
  ])
}

export const initialUsersState = {
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

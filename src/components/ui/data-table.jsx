'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  ChevronDown,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from './checkbox'
import Link from 'next/link'

export function DataTable({
  columns,
  data,
  filterColumn,
  filterPlaceholder = 'Filter...',
  showColumnToggle = true,
  csv_headers,
  csv_rows,
  href,
  downloadCSV, // Expect a downloadCSV function prop for CSV export
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {filterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={table.getState().globalFilter ?? ''}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          )}
        </div>
        <div className="flex space-x-4 items-center justify-center">
          {data?.length > 0 && csv_headers && csv_rows && downloadCSV && (
            <Button
              variant="outline"
              className="ml-auto"
              onClick={() =>
                downloadCSV({
                  headers: csv_headers,
                  rows: csv_rows(data),
                  filename: 'export.csv',
                })
              }
            >
              Download (csv)
            </Button>
          )}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="rounded-md border overflow-clip">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="mx-0 px-0 bg-blue-100">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => {
                    console.log('row.original :>> ', href, row.original)
                    if (row.original.id) {
                      if(href){
                        router.push(`${href}/${row.original.id}`)
                      }
                      // if in cost centres href /cost-centres/ID
                      // if in users href /users/ID
                      // if in clients href /clients/ID






                      
                      // if (row.original.id.includes('CC')) {
                      //   router.push(`/cost-centres/${row.original.id}`)
                      // } else if (row.original.id.includes('USR')) {
                      //   router.push(`/users/${row.original.id}`)
                      // } else if (row.original.id.includes('CL')) {
                      //   router.push(`/clients/${row.original.id}`)
                      // } else if (row.original.id.includes('VEH')) {
                      //   router.push(`/vehicles/${row.original.id}`)
                      // } else if (row.original.id.includes('DRV')) {
                      //   router.push(`/drivers/${row.original.id}`)
                      // } else if (row.original.id.includes('STP')) {
                      //   router.push(`/stop-points/${row.original.id}`)
                      // } else if (row.original.id.includes('TRP')) {
                      //   router.push(`/trips/${row.original.id}`)
                      // } else {
                      //   router.push(`${pathname}/${row.original.id}`)
                      // }
                    }
                  }}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (
                          e.target.closest('button') ||
                          e.target.closest('[role="checkbox"]')
                        ) {
                          e.stopPropagation()
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Checkbox column helper
export function createCheckboxColumn() {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

// Sortable column header helper
export function createSortableHeader(title) {
  return ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="h-auto w-full p-0 font-medium justify-between items-center m-0"
    >
      {title}
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  )
}

// Actions column with view/edit/delete
export function createActionsColumn({ data, onEdit, onDelete }) {
  const pathname = usePathname().slice(1)
  const accessibleRoutes = [] // Remove context use, handle permissions externally if needed

  const canEdit = accessibleRoutes.filter((p) => p.href.includes(pathname))
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Edit className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href={`/cost-centres/${data.id}`}>
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" /> View details
          </DropdownMenuItem>
        </Link>
        {/* Conditionally render edit/delete - integrate permission checks externally */}
        <DropdownMenuItem
          onClick={(e) => {
            // e.stopPropagation()
            // onEdit({ id: data.id })
          }}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={(e) => {
            // e.stopPropagation()
            // onDelete({ id: data.id })
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

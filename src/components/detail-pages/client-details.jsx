'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createCheckboxColumn,
  createSortableHeader,
  DataTable,
  createActionsColumn,
} from '../ui/data-table'
import DetailActionBar from '@/components/layout/detail-action-bar'
import DetailCard from '@/components/ui/detail-card'
import {
  MapPin,
  Clock,
  User,
  Truck,
  Newspaper,
  MapPinPlusInside,
  Phone,
} from 'lucide-react'
import { useGlobalContext } from '@/context/global-context/context'
import { Separator } from '../ui/separator'
import DisplayMap from '../map/display-map'
import { toast } from "sonner"

export default function ClientDetails({ id }) {
  const {
    trips,
    onEdit,
    onDelete,
    clients: { data },
  } = useGlobalContext()

  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchTrips = async () => {
    if (trips?.refetch) {
      trips.refetch()
    }
    const { data: tripData } = await supabase.from('trips').select('*').eq('client_id', id)
    return tripData
  }
  useEffect(() => {
    // Try to find client in context first
    let found = data?.find((c) => String(c.id) === String(id))
    if (found) {
      setClient(found)
      return
    }
    // Otherwise, fetch from Supabase
    if (id) {
      setLoading(true)
      import('@/lib/supabase/client')
        .then(({ createClient }) => {
          const supabase = createClient()
          supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
              if (error || !data) {
                toast({
                  title: 'Error',
                  description: 'Could not load client details.',
                  variant: 'destructive',
                })
              } else {
                setClient(data)
              }
            })
            .finally(() => setLoading(false))
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not load client details.',
            variant: 'destructive',
          })
          setLoading(false)
        })
    }
    fetchTrips()
  }, [id, data])

  // Prepare trips for this client
  const clientTrips =
    trips?.data?.filter((trip) => String(trip?.clientDetails?.id) === String(id)) || []

  // Prepare locations
  const pickupLocations = client?.pickup_locations || []
  const dropoffLocations = client?.dropoff_locations || []

  // Prepare invoices (replace with real data if available)
  const invoices = client?.invoices || []

  // Table columns
  const tripColumns = [
    createCheckboxColumn(),
    {
      accessorKey: 'id',
      header: createSortableHeader('Trip ID'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'pickupLocation',
      header: createSortableHeader('Route'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">
            {row.getValue('pickupLocation')}
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {row.original.dropoffLocation}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'driver',
      header: createSortableHeader('Driver'),
    },
    {
      accessorKey: 'vehicle',
      header: 'Vehicle',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')
        return (
          <Badge
            variant={
              status === 'Completed'
                ? 'default'
                : status === 'In Progress'
                  ? 'secondary'
                  : status === 'Scheduled'
                    ? 'outline'
                    : 'destructive'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'cost',
      header: createSortableHeader('Cost'),
      cell: ({ row }) => (
        <div className="font-medium">
          R{row.getValue('cost')?.toLocaleString() || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: createSortableHeader('Date'),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue('date')).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const trip = row.original
        return createActionsColumn({ data: trip, onEdit, onDelete })
      },
    },
  ]

  const locationColumns = [
    createCheckboxColumn(),
    {
      accessorKey: 'name',
      header: createSortableHeader('Location Name'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'address',
      header: createSortableHeader('Address'),
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-sm">{row.getValue('address')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'contact_person',
      header: createSortableHeader('Contact'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{row.getValue('contact_person')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'contact_phone',
      header: createSortableHeader('Phone'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{row.getValue('contact_phone')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'operating_hours',
      header: createSortableHeader('Hours'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{row.getValue('operating_hours')}</div>
        </div>
      ),
    },
  ]

  const invoiceColumns = [
    {
      accessorKey: 'id',
      header: createSortableHeader('Invoice ID'),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'date',
      header: createSortableHeader('Date'),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue('date')).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: createSortableHeader('Amount'),
      cell: ({ row }) => (
        <div className="font-medium">
          R{row.getValue('amount')?.toLocaleString() || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.getValue('status') === 'Paid' ? 'default' : 'secondary'}
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: createSortableHeader('Due Date'),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue('dueDate')).toLocaleDateString()}
        </div>
      ),
    },
  ]

  const tabs = [
    {
      value: 'trips',
      title: `Trips`,
      description: `All trips for ${client?.name || ''}`,
      columns: tripColumns,
      data: clientTrips,
      filterColumn: 'id',
      filterPlaceholder: 'Search trip...',
    },
    {
      value: 'locations',
      title: `Locations`,
      description: `Pickup and dropoff locations for ${client?.name || ''}`,
      columns: null,
      data: null,
      filterColumn: null,
      filterPlaceholder: null,
    },
    {
      value: 'invoices',
      title: `Invoices`,
      description: `All invoices issued to ${client?.name || ''}`,
      columns: invoiceColumns,
      data: invoices,
      filterColumn: 'id',
      filterPlaceholder: 'Search invoices...',
    },
  ]

  const client_information = [
    { label: 'ID', value: client?.id },
    { label: 'Name', value: client?.name },
    { label: 'Contact Person', value: client?.contact_person },
    { label: 'Email', value: client?.email },
    { label: 'Phone', value: client?.phone },
    { label: 'Address', value: client?.address },
    { label: 'Tax Number', value: client?.tax_number },
    { label: 'Industry', value: client?.industry },
    {
      label: 'Status',
      value: (
        <Badge variant={client?.status === 'Active' ? 'default' : 'secondary'}>
          {client?.status}
        </Badge>
      ),
    },
  ]

  if (loading || !client) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <DetailActionBar id={id} title={client?.name} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Information */}
        <DetailCard
          title={`Client Information`}
          description={'Detailed information about this client'}
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {client_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </dl>
          <Separator className="my-4" />
          <div>
            <h4 className="text-sm font-medium text-gray-500">Notes</h4>
            <p className="mt-1 text-sm text-gray-900">
              {client?.notes || 'No notes available.'}
            </p>
          </div>
        </DetailCard>

        {/* Client Overview */}
        <DetailCard
          title={`Client Overview`}
          description={'Overview of trips associated with this client'}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
              <Truck className="h-8 w-8 text-blue-500 dark:text-blue-300" />
              <h3 className="mt-2 text-xl font-bold">
                {clientTrips?.length || 0}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Trips
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-orange-50 p-4 dark:bg-orange-900">
              <MapPinPlusInside className="h-8 w-8 text-orange-500 dark:text-orange-300" />
              <h3 className="mt-2 text-xl font-bold">
                {(pickupLocations.length || 0) + (dropoffLocations.length || 0)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Locations
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-4 dark:bg-green-900">
              <Newspaper className="h-8 w-8 text-green-500 dark:text-green-300" />
              <h3 className="mt-2 text-xl font-bold">
                {invoices.length || 0}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invoices
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">
              Cost Centre location
            </label>
            <div className="mt-2 h-[200px] rounded-lg bg-gray-100 flex items-center justify-center">
              <DisplayMap
                coords={client?.coords}
                street={client?.street}
                city={client?.city}
                state={client?.state}
                country={client?.country}
              />
            </div>
          </div>
        </DetailCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tabs[0].value} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-6">
          {tabs.map((trigger) => (
            <TabsTrigger key={trigger.value} value={trigger.value}>
              <h6 className="capitalize">{`${trigger.value} (${trigger.value === 'locations'
                ? (pickupLocations.length || 0) + (dropoffLocations.length || 0)
                : trigger?.data?.length || '0'
                })`}</h6>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="space-y-4"
          >
            {tab.value === 'locations' ? (
              <div className="space-y-6">
                <DetailCard
                  title="Pickup Locations"
                  description={`Locations where goods are collected from (${pickupLocations.length})`}
                >
                  {pickupLocations.length > 0 ? (
                    <DataTable
                      columns={locationColumns}
                      data={pickupLocations}
                      filterColumn="name"
                      filterPlaceholder="Search pickup locations..."
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No pickup locations configured for this client.</p>
                    </div>
                  )}
                </DetailCard>
                <DetailCard
                  title="Dropoff Locations"
                  description={`Locations where goods are delivered to (${dropoffLocations.length})`}
                >
                  {dropoffLocations.length > 0 ? (
                    <DataTable
                      columns={locationColumns}
                      data={dropoffLocations}
                      filterColumn="name"
                      filterPlaceholder="Search dropoff locations..."
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No dropoff locations configured for this client.</p>
                    </div>
                  )}
                </DetailCard>
              </div>
            ) : (
              <DetailCard title={tab.title} description={tab.description}>
                <DataTable
                  columns={tab.columns}
                  data={tab.data}
                  filterColumn={tab.filterColumn}
                  filterPlaceholder={tab.filterPlaceholder}
                />
              </DetailCard>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

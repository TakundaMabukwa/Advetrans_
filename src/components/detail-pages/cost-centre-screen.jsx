'use client'

import { useEffect, useState } from 'react'
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Users, Truck, Route } from 'lucide-react'
import { useGlobalContext } from '@/context/global-context/context'
import DisplayMap from '../map/display-map'
import DetailActionBar from '../layout/detail-action-bar'
import DetailCard from '../ui/detail-card'

export default function CostCenterDetails({ id }) {
  const { users, vehicles, trips } = useGlobalContext()
  const [costCenter, setCostCenter] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!costCenter && id) {
      setLoading(true);
      import('@/lib/supabase/client')
        .then(({ createClient }) => {
          const supabase = createClient();
          supabase
            .from('breakdown_cost_centers')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data, error }) => {
              if (error || !data) {
                toast({
                  title: 'Error',
                  description: 'Could not load cost center details.',
                  variant: 'destructive',
                });
              } else {
                setCostCenter(data);
              }
            })
            .finally(() => setLoading(false));
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Could not load cost center details.',
            variant: 'destructive',
          });
          setLoading(false);
        });
    }
  }, [id, costCenter, toast]);

  const cc = costCenter || {
    id: 'Not Found',
    name: 'Cost Center Not Found',
    street: '',
    city: '',
    state: '',
    country: '',
    coords: '',
    manager: 'Unknown',
    manager_email: 'Unknown',
    manager_phone: 'Unknown',
    users: 0,
    vehicles: 0,
    activeTrips: 0,
    status: 'inactive',
    established: '',
    budget: '',
    description: '',
  };

  const userStats = users?.data?.filter(u => u.costCentre === cc.name) || [];
  const vehicleStats = vehicles?.data?.filter(v => v.costCentre === cc.name) || [];
  const tripStats = trips?.data?.filter(t => t.costCentre === cc.name) || [];

  const cost_center_info = [
    { label: 'ID', value: cc.id || 'N/A' },
    { label: 'Name', value: cc.name || 'N/A' },
    { label: 'Manager', value: cc.manager || 'N/A' },
    { label: 'Manager Email', value: cc.manager_email || 'N/A' },
    { label: 'Manager Phone', value: cc.manager_phone || 'N/A' },
    { label: 'Street', value: cc.street || 'N/A' },
    { label: 'City', value: cc.city || 'N/A' },
    { label: 'State', value: cc.state || 'N/A' },
    { label: 'Country', value: cc.country || 'N/A' },
    {
      label: 'Status',
      value: (
        <Badge variant={cc.status === 'active' ? 'success' : 'secondary'}>
          {cc.status || 'active'}
        </Badge>
      ),
    },
    { label: 'Established', value: cc.established || 'N/A' },
    { label: 'Budget', value: cc.budget || 'N/A' },
  ]

  if (loading) {
    return <div>Loading cost center data...</div>;
  }

  return (
    <div className="space-y-6">
      <DetailActionBar id={id} title={cc.name} />

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={'Cost Center Information'}
          description={'Detailed information about this cost center'}
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cost_center_info.map((info) => (
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
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="mt-1 text-sm text-gray-900">
              {cc.description || 'No description available.'}
            </p>
          </div>
        </DetailCard>

        <DetailCard
          title={'Cost Center overview'}
          description={'Overview of resources in this cost center'}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-300" />
              <h3 className="mt-2 text-xl font-bold">{userStats.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-orange-50 p-4 dark:bg-orange-900">
              <Truck className="h-8 w-8 text-orange-500 dark:text-orange-300" />
              <h3 className="mt-2 text-xl font-bold">{vehicleStats.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vehicles
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-4 dark:bg-green-900">
              <Route className="h-8 w-8 text-green-500 dark:text-green-300" />
              <h3 className="mt-2 text-xl font-bold">{tripStats.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Trips
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">
              Location
            </label>
            <div className="mt-2 h-[200px] rounded-lg bg-gray-100 flex items-center justify-center">
              <DisplayMap
                coords={cc.coords}
                street={cc.street}
                city={cc.city}
                state={cc.state}
                country={cc.country}
              />
            </div>
          </div>
        </DetailCard>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3 gap-6">
          <TabsTrigger value="users">{`Users (${userStats?.length || 0})`}</TabsTrigger>
          <TabsTrigger value="vehicles">{`Vehicles (${vehicleStats?.length || 0})`}</TabsTrigger>
          <TabsTrigger value="trips">{`Trips (${tripStats?.length || 0})`}</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users in {cc.name}</CardTitle>
              <CardDescription>
                All users assigned to this cost center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { accessorKey: 'id', header: 'ID' },
                  { accessorKey: 'name', header: 'Name' },
                  { accessorKey: 'role', header: 'Role' },
                  { accessorKey: 'email', header: 'Email' },
                  { accessorKey: 'department', header: 'Department' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge
                        variant={row.getValue('status') === 'active' ? 'success' : 'secondary'}
                      >
                        {row.getValue('status')}
                      </Badge>
                    ),
                  },
                ]}
                data={userStats}
                filterColumn="name"
                filterPlaceholder="Search users..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles in {cc.name}</CardTitle>
              <CardDescription>
                All vehicles assigned to this cost center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { accessorKey: 'id', header: 'ID' },
                  { accessorKey: 'type', header: 'Type' },
                  { accessorKey: 'model', header: 'Model' },
                  { accessorKey: 'regNumber', header: 'Reg Number' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => {
                      const status = row.getValue('status')
                      let badgeClass = ''
                      switch (status) {
                        case 'in-use':
                          badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
                          break
                        case 'available':
                          badgeClass = 'bg-green-100 text-green-800 border-green-200'
                          break
                        case 'maintenance':
                          badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'
                          break
                        default:
                          badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                      return (
                        <Badge variant="outline" className={badgeClass}>
                          {status}
                        </Badge>
                      )
                    },
                  },
                  { accessorKey: 'lastService', header: 'Last Service' },
                ]}
                data={vehicleStats}
                filterColumn="model"
                filterPlaceholder="Search vehicles..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trips in {cc.name}</CardTitle>
              <CardDescription>
                All trips associated with this cost center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { accessorKey: 'id', header: 'ID' },
                  { accessorKey: 'driver', header: 'Driver' },
                  { accessorKey: 'vehicle', header: 'Vehicle' },
                  { accessorKey: 'departure', header: 'Departure' },
                  { accessorKey: 'destination', header: 'Destination' },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => {
                      const status = row.getValue('status')
                      let badgeClass = ''
                      switch (status) {
                        case 'in-progress':
                          badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
                          break
                        case 'scheduled':
                          badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
                          break
                        case 'completed':
                          badgeClass = 'bg-green-100 text-green-800 border-green-200'
                          break
                        default:
                          badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                      return (
                        <Badge variant="outline" className={badgeClass}>
                          {status}
                        </Badge>
                      )
                    },
                  },
                  {
                    accessorKey: 'progress',
                    header: 'Progress',
                    cell: ({ row }) => (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className={`h-2.5 rounded-full ${row.original.status === 'completed'
                              ? 'bg-green-500'
                              : row.original.status === 'in-progress'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                              }`}
                            style={{ width: `${row.getValue('progress')}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {row.getValue('progress')}%
                        </span>
                      </div>
                    ),
                  },
                ]}
                data={tripStats}
                filterColumn="id"
                filterPlaceholder="Search trips..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

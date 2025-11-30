'use client'

// next
import { useRouter } from 'next/navigation'

// components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { UserCircle, CheckCircle, Clock, Route, MapPin } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'

// context
import { useGlobalContext } from '@/context/global-context/context'

// components
import DetailActionBar from '@/components/layout/detail-action-bar'
import DetailCard from '@/components/ui/detail-card'

// Function to get status badge
const getStatusBadge = (status) => {
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
    case 'on-trip':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-3 w-3 mr-1" /> On Trip
        </Badge>
      )
    case 'off-duty':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
        >
          <UserCircle className="h-3 w-3 mr-1" /> Off Duty
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

export default function DriverDetails({ id }) {
  const router = useRouter()
  const { drivers } = useGlobalContext()
  // Find the driver with the matching ID
  const driver = drivers.data.find((d) => d.id === id) || {
    id: 'Not Found',
    name: 'Driver Not Found',
    phone: 'Unknown',
    license: 'Unknown',
    experience: 'Unknown',
    status: 'unknown',
    costCentre: 'Unknown',
    currentVehicle: 'None',
  }

  // Column definitions for recent trips
  const tripColumns = [
    {
      accessorKey: 'id',
      header: 'Trip ID',
    },
    {
      accessorKey: 'route',
      header: 'Route',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue('status') === 'completed' ? 'success' : 'secondary'
          }
        >
          {row.getValue('status')}
        </Badge>
      ),
    },
  ]

  const tabs = [
    {
      value: 'trips',
      title: `Recent Trips`,
      description: `History of recent trips by ${driver.name}`,
      // columns: tripColumns,
      // data: driver.recentTrips || [],
      // filterColumn: 'id',
      // filterPlaceholder: 'Search trips...',
    },
    {
      value: 'driving-record',
      title: `Driving Record`,
      description: `Driver's safety record and violations`,
      // columns: vehicleColumns,
      // data: vehicleStats,
      // filterColumn: 'model',
      // filterPlaceholder: 'Search vehicles...',
    },
    {
      value: 'emergency-contact',
      title: `Emergency Contact`,
      description: 'Emergency contact information',
      // columns: tripColumns,
      // data: tripStats,
      // filterColumn: 'id',
      // filterPlaceholder: 'Search trips...',
    },
  ]

  const driver_information = [
    { label: 'ID', value: driver.id },
    { label: 'Name', value: `${driver.name} ${driver.lastName}` },
    { label: 'Phone', value: driver.phone },
    { label: 'Email', value: driver.email || 'N/A' },
    { label: 'License Number', value: driver.license },
    { label: 'License Code', value: driver.licenseCode || 'N/A' },
    { label: 'License Expiry', value: driver.licenseExpiry || 'N/A' },
    { label: 'ID Type', value: driver.idDoctype || 'N/A' },
    { label: 'ID Number', value: driver.identityNumber || 'N/A' },
    { label: 'Status', value: getStatusBadge(driver.status) },
    { label: 'Cost Centre', value: driver.costCentre },
    { label: 'Current Vehicle', value: driver.currentVehicle },
    { label: 'Address', value: driver.address || 'N/A' },
    { label: 'Date of Birth', value: driver.dateOfBirth || 'N/A' },
    { label: 'Experience', value: driver.experience || 'N/A' },
  ]

  return (
    <div className="space-y-6">
      <DetailActionBar id={id} title={driver.name} description={driver.phone} />

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={'Driver Information'}
          description={'Detailed information about this driver'}
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {driver_information.map((info) => (
              <div key={info.label}>
                <dt className="text-sm font-medium text-gray-500">
                  {info.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{info.value}</dd>
              </div>
            ))}
          </dl>
        </DetailCard>

        <DetailCard
          title={'Current Status'}
          description={'Current trip and driver status'}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">
                Current Status
              </h4>
              <div>{getStatusBadge(driver.status)}</div>
            </div>

            <Separator />

            {driver.currentTrip ? (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Current Trip
                </h4>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">
                      Trip {driver.currentTrip.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-sm">{driver.currentTrip.departure}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="text-sm">
                        {driver.currentTrip.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Departure</p>
                      <p className="text-sm">
                        {driver.currentTrip.departureTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="text-sm">
                        {driver.currentTrip.estimatedArrival}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {driver.currentTrip.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-gray-500">No active trip</span>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {driver.certifications?.map((cert) => (
                  <Badge
                    key={cert}
                    variant="outline"
                    className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"
                  >
                    {cert}
                  </Badge>
                )) || <span className="text-gray-500">No certifications</span>}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Important Dates
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">License Expiry</p>
                  <p className="text-sm font-medium">
                    {driver.licenseExpiry || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Medical Exam Expiry</p>
                  <p className="text-sm font-medium">
                    {driver.medicalExamExpiry || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hire Date</p>
                  <p className="text-sm font-medium">
                    {driver.hireDate || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DetailCard>
      </div>

      <Tabs defaultValue="trips">
        <TabsList className="grid w-full grid-cols-3 gap-6">
          {tabs.map((trigger, id) => (
            <TabsTrigger key={id} value={trigger.value}>
              <h6 className="capitalize">
                {trigger.value}
                {trigger?.data ? `(${trigger?.data?.length || '0'})` : null}
              </h6>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trips</CardTitle>
              <CardDescription>
                History of recent trips by this driver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={tripColumns}
                data={driver.recentTrips || []}
                filterColumn="id"
                filterPlaceholder="Search trips..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="driving-record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driving Record</CardTitle>
              <CardDescription>
                Driver's safety record and violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {driver.drivingRecord ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h3 className="text-sm text-gray-500">Violations</h3>
                    <p className="text-2xl font-bold">
                      {driver.drivingRecord.violations}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h3 className="text-sm text-gray-500">Accidents</h3>
                    <p className="text-2xl font-bold">
                      {driver.drivingRecord.accidents}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h3 className="text-sm text-gray-500">Last Review</h3>
                    <p className="text-lg font-medium">
                      {driver.drivingRecord.lastReviewDate}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No driving record available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emergency-contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent>
              {driver.emergencyContact ? (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {driver.emergencyContact}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {driver.emergencyPhone}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-gray-500">
                  No emergency contact information available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

// next
import { useRouter } from 'next/navigation'

// components
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Users,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Mail,
  Phone,
  Calendar,
  User,
  Building,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// context
import { useGlobalContext } from '@/context/global-context/context'

// components
import DetailActionBar from '@/components/layout/detail-action-bar'
import DetailCard from '@/components/ui/detail-card'

// Function to get role badge
const getRoleBadge = (role) => {
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

export default function UserDetails({ id }) {
  const router = useRouter()
  const { cost_centres, users, vehicles, trips, onEdit, onDelete } =
    useGlobalContext()

  // Find the user with the matching ID
  const user = users.data.find((u) => u.id === id) || {
    id: 'Not Found',
    name: 'User Not Found',
    lastName: '',
    email: 'Unknown',
    role: 'unknown',
    costCentre: 'Unknown',
    lastLogin: 'Unknown',
    status: 'inactive',
  }

  const tabs = [
    {
      value: 'activity',
      title: `Recent Activity`,
      description: `${user.name}'s recent activities`,
    },
    {
      value: 'security',
      title: `Security Settings`,
      description: 'Manage user security settings',
    },
  ]

  const user_information = [
    {
      label: 'ID',
      value: user.id,
    },
    {
      label: 'Name',
      value: `${user.name} ${user.lastName || ''}`,
    },
    {
      label: 'Email',
      value: user.email,
    },
    {
      label: 'Phone',
      value: user.phone || 'N/A',
    },
    {
      label: 'Role',
      value: getRoleBadge(user.role),
    },
    {
      label: 'Department',
      value: user.department || 'N/A',
    },
    {
      label: 'Position',
      value: user.position || 'N/A',
    },
    {
      label: 'Cost Centre',
      value: user.costCentre,
    },
    {
      label: 'Status',
      value: (
        <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
          {user.status || 'inactive'}
        </Badge>
      ),
    },
    {
      label: 'Join Date',
      value: user.joinDate || 'N/A',
    },
    {
      label: 'Last Login',
      value:
        new Date(user?.recentActivities?.[0]?.timestamp).toLocaleString() ||
        ' N/A',
    },
  ]

  return (
    <div className="space-y-6">
      <DetailActionBar
        id={id}
        title={`${user.name} ${user.lastName || ''}`}
        description={user.email}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <DetailCard
          title={'User Information'}
          description={'Detailed information about this user'}
        >
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {user_information.map((info) => (
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
          title={'Permissions & Access'}
          description={'User permissions and access control'}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Permissions
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((permission) => (
                    <Badge
                      key={permission?.name}
                      variant="outline"
                      className="bg-gray-100 dark:bg-gray-800"
                    >
                      {permission?.name?.replace(/_/g, ' ')}
                      {permission?.access && permission.access !== 'none' && (
                        <span className="ml-1 text-xs">
                          ({permission.access})
                        </span>
                      )}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No permissions assigned
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Managed Cost Centres
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.managedCostCentres &&
                user.managedCostCentres.length > 0 ? (
                  user.managedCostCentres.map((centre) => (
                    <Badge
                      key={centre}
                      variant="outline"
                      className="bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-900 dark:text-violet-200"
                    >
                      {centre}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No cost centres managed
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Assigned Vehicles
              </h4>
              {user.assignedVehicles && user.assignedVehicles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.assignedVehicles.map((vehicle) => (
                    <Badge
                      key={vehicle}
                      variant="outline"
                      className="bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200"
                    >
                      {vehicle}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  No vehicles assigned
                </span>
              )}
            </div>
          </div>
        </DetailCard>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-6">
          {tabs.map((trigger, id) => (
            <TabsTrigger key={id} value={trigger.value}>
              <h6 className="capitalize">{trigger.title}</h6>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <DetailCard
            title={'Recent Activity'}
            description={"User's recent actions and logins"}
          >
            <div className="space-y-4">
              {user?.recentActivities && user.recentActivities.length > 0 ? (
                user.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span>
                          {new Date(activity?.timestamp).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>Activity: {activity?.activity}</span>
                        <span>•</span>
                        <span>IP: {activity?.ip}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>
          </DetailCard>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <DetailCard
            title={'Security Settings'}
            description={'Manage user security settings'}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password Reset</h4>
                  <p className="text-sm text-gray-500">
                    Force user to reset their password
                  </p>
                </div>
                <Button variant="outline">Reset Password</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Account Lock</h4>
                  <p className="text-sm text-gray-500">
                    Temporarily lock this user account
                  </p>
                </div>
                <Button variant="outline">Lock Account</Button>
              </div>
            </div>
          </DetailCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

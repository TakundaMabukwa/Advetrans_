// 'use client'

// // react
// import { useState } from 'react'

// // components
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'

// // icons
// import {
//   Save,
//   Users,
//   ShieldCheck,
//   ShieldAlert,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react'

// // context
// import { useGlobalContext } from '@/context/global-context/context'

// // Function to get role badge for preview
// const getRoleBadge = (role) => {
//   switch (role) {
//     case 'admin':
//       return (
//         <Badge className="bg-violet-500 hover:bg-violet-600">
//           <ShieldCheck className="h-3 w-3 mr-1" /> Admin
//         </Badge>
//       )
//     case 'manager':
//       return (
//         <Badge
//           variant="outline"
//           className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
//         >
//           <ShieldAlert className="h-3 w-3 mr-1" /> Manager
//         </Badge>
//       )
//     case 'user':
//       return (
//         <Badge
//           variant="outline"
//           className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
//         >
//           <Users className="h-3 w-3 mr-1" /> User
//         </Badge>
//       )
//     default:
//       return <Badge>{role}</Badge>
//   }
// }

// const UserForm = ({ onCancel, id }) => {
//   const {
//     users,
//     u_api,
//     users: { loading, error },
//     usersDispatch,
//     cost_centres,
//   } = useGlobalContext()
//   const user = users.data.find((u) => u.id === id)
//   const [formData, setFormData] = useState({
//     id: user?.id || '',
//     name: user?.name || '',
//     lastName: user?.lastName || '',
//     email: user?.email || '',
//     role: user?.role || 'user',
//     costCentre: user?.costCentre || '',
//     status: user?.status || 'active',
//     phone: user?.phone || '',
//     department: user?.department || '',
//     position: user?.position || '',
//     joinDate: user?.joinDate || '',
//     permissions: user?.permissions || [],
//     managedCostCentres: user?.managedCostCentres || [],
//   })
//   const [currentTab, setCurrentTab] = useState(0)

//   const tabs = [
//     { name: 'Basic Information', value: 'basic' },
//     { name: 'Permissions & Access', value: 'permissions' },
//   ]

//   const nextStep = (index) => {
//     if (currentTab < tabs.length - 1) {
//       setCurrentTab((prev) => prev + 1)
//     }
//   }

//   const prevStep = (index) => {
//     if (currentTab > 0) {
//       setCurrentTab((prev) => prev - 1)
//     }
//   }

//   const paginationButtons = [
//     {
//       type: 'button',
//       variant: 'outline',
//       onClick: (index) => prevStep(index),
//       name: 'Back',
//     },
//     {
//       type: 'button',
//       onClick: (index) => nextStep(index),
//       name: 'Next',
//     },
//   ]

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleSelectChange = (name, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleCostCentreChange = (centre) => {
//     setFormData((prev) => {
//       const centres = [...prev.managedCostCentres]
//       if (centres.includes(centre)) {
//         return {
//           ...prev,
//           managedCostCentres: centres.filter((c) => c !== centre),
//         }
//       } else {
//         return {
//           ...prev,
//           managedCostCentres: [...centres, centre],
//         }
//       }
//     })
//   }

//   const onSubmit = async (data) => {
//     setCurrentTab(0)

//     u_api.upsertUser(id, data, usersDispatch)

//     onCancel()
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onSubmit(formData)
//   }

//   const availablePermissions = [
//     { name: 'manage_cost_centres', access: 'none' },
//     { name: 'manage_users', access: 'none' },
//     { name: 'manage_clients', access: 'none' },
//     { name: 'manage_vehicles', access: 'none' },
//     { name: 'manage_drivers', access: 'none' },
//     { name: 'manage_stop_points', access: 'none' },
//     { name: 'manage_trips', access: 'none' },
//     { name: 'manage_financials', access: 'none' },
//     { name: 'manage_operations', access: 'none' },
//     { name: 'view_reports', access: 'none' },
//     { name: 'edit_settings', access: 'none' },
//   ]

//   const getPermissionAccess = (name) => {
//     return formData.permissions.find((p) => p.name === name)?.access || ''
//   }

//   const handlePermissionChange = (name, access) => {
//     setFormData((prev) => {
//       const existing = prev.permissions.find((p) => p.name === name)
//       let updatedPermissions

//       if (existing) {
//         if (existing.access === access) {
//           // If same access clicked again, remove the permission
//           updatedPermissions = prev.permissions.filter((p) => p.name !== name)
//         } else {
//           // Update access
//           updatedPermissions = prev.permissions.map((p) =>
//             p.name === name ? { ...p, access } : p
//           )
//         }
//       } else {
//         // Add new permission
//         updatedPermissions = [...prev.permissions, { name, access }]
//       }

//       return {
//         ...prev,
//         permissions: updatedPermissions,
//       }
//     })
//   }

//   //console.log('formData permissions :>> ', formData.permissions)

//   const defaultCostCentres = [
//     'Gauteng Region',
//     'Western Cape Region',
//     'KwaZulu-Natal Region',
//     'Eastern Cape Region',
//     'Limpopo Region',
//   ]

//   const displayCostCentres =
//     cost_centres.length > 0 ? cost_centres : defaultCostCentres
//   //  console.log('displayCostCentres :>> ', displayCostCentres)

//   // console.log(
//   //   'formData.permissions.length < 0 :>> ',
//   //   formData.permissions.length <= 0
//   // )

//   //console.log('name :>> ', !formData?.email?.includes('@'))

//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="space-y-6">
//         <div className="flex items-center gap-2">
//           <div>
//             <h2 className="text-2xl font-bold tracking-tight">
//               {user?.id ? `Edit User` : 'Add New User'}
//             </h2>
//             <p className="text-muted-foreground">
//               {user?.id ? user.name : 'Enter user details'}
//             </p>
//           </div>
//         </div>

//         <Tabs
//           value={tabs[currentTab]?.value}
//           onValueChange={(value) => {
//             const index = tabs.findIndex((tab) => tab.value === value)
//             setCurrentTab(index)
//           }}
//           className="w-full"
//         >
//           <TabsList className="grid w-full grid-cols-2 gap-6">
//             {tabs.map((tab, index) => (
//               <TabsTrigger
//                 key={index}
//                 tabIndex={currentTab}
//                 value={tab.value}
//                 onClick={() => {
//                   console.log('index :>> ', index)
//                   setCurrentTab(index)
//                 }}
//               >
//                 {tab.name}
//               </TabsTrigger>
//             ))}
//           </TabsList>

//           <TabsContent value="basic" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Information</CardTitle>
//                 <CardDescription>
//                   Basic information about this user
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                   {user?.id && (
//                     <div className="space-y-2">
//                       <Label htmlFor="id">ID</Label>
//                       <Input
//                         id="id"
//                         name="id"
//                         value={formData.id}
//                         onChange={handleChange}
//                         readOnly
//                       />
//                     </div>
//                   )}

//                   <div className="space-y-2">
//                     <Label htmlFor="name">Name *</Label>
//                     <Input
//                       id="name"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       placeholder="e.g., John"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="lastName">Last Name *</Label>
//                     <Input
//                       id="lastName"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       placeholder="e.g., Smith"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email *</Label>
//                     <Input
//                       id="email"
//                       name="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       placeholder="john.smith@company.com"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="phone">Phone</Label>
//                     <Input
//                       id="phone"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       placeholder="+27 82 123 4567"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="department">Department</Label>
//                     <Input
//                       id="department"
//                       name="department"
//                       value={formData.department}
//                       onChange={handleChange}
//                       placeholder="e.g., Operations"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="position">Position</Label>
//                     <Input
//                       id="position"
//                       name="position"
//                       value={formData.position}
//                       onChange={handleChange}
//                       placeholder="e.g., Fleet Manager"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="costCentre">Cost Centre</Label>
//                     <Select
//                       value={formData.costCentre}
//                       onValueChange={(value) =>
//                         handleSelectChange('costCentre', value)
//                       }
//                     >
//                       <SelectTrigger id="costCentre" className={'w-full'}>
//                         <SelectValue placeholder="Select cost centre" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {cost_centres?.data?.map((centre) => {
//                           //  console.log('centre :>> ', centre)
//                           return (
//                             <SelectItem key={centre.id} value={centre.name}>
//                               {centre.name}
//                             </SelectItem>
//                           )
//                         })}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="status">Status</Label>
//                     <Select
//                       value={formData.status}
//                       onValueChange={(value) =>
//                         handleSelectChange('status', value)
//                       }
//                     >
//                       <SelectTrigger id="status" className={'w-full'}>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="active">Active</SelectItem>
//                         <SelectItem value="inactive">Inactive</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="joinDate">Join Date</Label>
//                     <Input
//                       id="joinDate"
//                       name="joinDate"
//                       type="date"
//                       value={formData.joinDate}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="role">Role</Label>
//                     <Select
//                       value={formData.role}
//                       onValueChange={(value) =>
//                         handleSelectChange('role', value)
//                       }
//                     >
//                       <SelectTrigger id="role" className={'w-full'}>
//                         <SelectValue placeholder="Select role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="admin">Admin</SelectItem>
//                         <SelectItem value="manager">Manager</SelectItem>
//                         <SelectItem value="user">User</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <div className="mt-2">{getRoleBadge(formData.role)}</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="permissions" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Permissions</CardTitle>
//                 <CardDescription>
//                   Set user permissions and access control
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <div className=" grid grid-cols-12">
//                       <h4 className=" col-span-9 text-sm font-medium text-gray-500 mb-2">
//                         Permissions
//                       </h4>
//                       <div className="col-span-3 grid grid-cols-3 items-center  justify-center  bg-green-600">
//                         <span className="text-sm text-center font-medium text-gray-500 mb-2">
//                           View
//                         </span>
//                         <span className="text-sm text-center font-medium text-gray-500 mb-2">
//                           Edit
//                         </span>
//                         <span className="text-sm text-center font-medium text-gray-500 mb-2">
//                           None
//                         </span>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 ">
//                       {availablePermissions.map((permission) => (
//                         <div
//                           key={permission.name}
//                           className="grid grid-cols-12 justify-between items-center"
//                         >
//                           <div className="col-span-9">
//                             <span className="capitalize text-sm font-medium">
//                               {permission.name.replace(/_/g, ' ')}
//                             </span>
//                           </div>

//                           <div className="col-span-3 grid grid-cols-3  bg-green-600">
//                             {/* View (Read) */}
//                             <div className="items-center justify-center">
//                               <Checkbox
//                                 checked={
//                                   getPermissionAccess(permission.name) ===
//                                   'read'
//                                 }
//                                 onCheckedChange={() =>
//                                   handlePermissionChange(
//                                     permission.name,
//                                     'read'
//                                   )
//                                 }
//                               />
//                             </div>

//                             {/* Edit (Write) */}
//                             <Checkbox
//                               checked={
//                                 getPermissionAccess(permission.name) === 'write'
//                               }
//                               onCheckedChange={() =>
//                                 handlePermissionChange(permission.name, 'write')
//                               }
//                             />

//                             {/* None */}
//                             <Checkbox
//                               checked={
//                                 getPermissionAccess(permission.name) === ''
//                               }
//                               onCheckedChange={() =>
//                                 handlePermissionChange(permission.name, '')
//                               }
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     {/* <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//                       {availablePermissions.map((permission) => (
//                         <div
//                           key={permission}
//                           className="flex items-center space-x-2"
//                         >
//                           <Checkbox
//                             id={permission}
//                             checked={formData.permissions.includes(permission)}
//                             onCheckedChange={() =>
//                               handlePermissionChange(permission)
//                             }
//                           />
//                           <Label htmlFor={permission} className="capitalize">
//                             {permission.replace(/_/g, ' ')}
//                           </Label>
//                         </div>
//                       ))}
//                     </div> */}
//                   </div>

//                   <Separator />

//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500 mb-2">
//                       Managed Cost Centres
//                     </h4>
//                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
//                       {cost_centres?.data?.map((centre) => {
//                         // console.log('centre :>> ', centre)
//                         return (
//                           <div
//                             key={centre.id}
//                             className="flex items-center space-x-2"
//                           >
//                             <Checkbox
//                               id={centre.id}
//                               checked={formData.managedCostCentres.includes(
//                                 centre.name
//                               )}
//                               onCheckedChange={() =>
//                                 handleCostCentreChange(centre.name)
//                               }
//                             />
//                             <Label htmlFor={centre.id}>{centre.name}</Label>
//                           </div>
//                         )
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         <div className="flex justify-between gap-2">
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//           <div className="items-center space-x-2">
//             <Button
//               type="button"
//               variant="outline"
//               className={currentTab == 0 ? 'shadow-none' : 'shadow'}
//               disabled={currentTab == 0}
//               onClick={prevStep}
//             >
//               <ChevronLeft />
//             </Button>
//             <Button
//               variant="outline"
//               type="button"
//               className={currentTab == 1 ? 'shadow-none' : 'shadow'}
//               disabled={currentTab == 1}
//               onClick={nextStep}
//             >
//               <ChevronRight />
//             </Button>
//           </div>

//           <Button
//             type="submit"
//             disabled={
//               currentTab == 0 ||
//               formData.name.length <= 3 ||
//               formData.email.length < 6 ||
//               !formData?.email?.includes('@') ||
//               formData.permissions.length <= 0 ||
//               formData.managedCostCentres.length <= 0
//             }
//           >
//             <Save className="mr-2 h-4 w-4" /> Save User
//           </Button>
//         </div>
//       </div>
//     </form>
//   )
// }

// export default UserForm

'use client'

// react
import { useState } from 'react'

// components
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// icons
import {
  Save,
  Users,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// context
import { useGlobalContext } from '@/context/global-context/context'

// Function to get role badge for preview
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

const UserForm = ({ onCancel, id }) => {
  const {
    users,
    u_api,
    users: { loading, error },
    usersDispatch,
    cost_centres,
  } = useGlobalContext()
  const user = users.data.find((u) => u.id === id)
  const [formData, setFormData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'user',
    costCentre: user?.costCentre || '',
    status: user?.status || 'active',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
    joinDate: user?.joinDate || '',
    permissions: user?.permissions || [],
    managedCostCentres: user?.managedCostCentres || [],
  })
  const [currentTab, setCurrentTab] = useState(0)

  const tabs = [
    { name: 'Basic Information', value: 'basic' },
    { name: 'Permissions & Access', value: 'permissions' },
  ]

  const nextStep = (index) => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab((prev) => prev + 1)
    }
  }

  const prevStep = (index) => {
    if (currentTab > 0) {
      setCurrentTab((prev) => prev - 1)
    }
  }

  const paginationButtons = [
    {
      type: 'button',
      variant: 'outline',
      onClick: (index) => prevStep(index),
      name: 'Back',
    },
    {
      type: 'button',
      onClick: (index) => nextStep(index),
      name: 'Next',
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCostCentreChange = (centre) => {
    setFormData((prev) => {
      const centres = [...prev.managedCostCentres]
      if (centres.includes(centre)) {
        return {
          ...prev,
          managedCostCentres: centres.filter((c) => c !== centre),
        }
      } else {
        return {
          ...prev,
          managedCostCentres: [...centres, centre],
        }
      }
    })
  }

  const onSubmit = async (data) => {
    setCurrentTab(0)

    u_api.upsertUser(id, data, usersDispatch)

    onCancel()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const availablePermissions = [
    { name: 'manage_cost_centres', access: 'none' },
    { name: 'manage_users', access: 'none' },
    { name: 'manage_clients', access: 'none' },
    { name: 'manage_vehicles', access: 'none' },
    { name: 'manage_drivers', access: 'none' },
    { name: 'manage_stop_points', access: 'none' },
    { name: 'manage_trips', access: 'none' },
    { name: 'manage_financials', access: 'none' },
    { name: 'manage_operations', access: 'none' },
    { name: 'view_reports', access: 'none' },
    { name: 'edit_settings', access: 'none' },
  ]

  const getPermissionAccess = (name) => {
    return formData.permissions.find((p) => p.name === name)?.access || ''
  }

  const handlePermissionChange = (name, access) => {
    setFormData((prev) => {
      const existing = prev.permissions.find((p) => p.name === name)
      let updatedPermissions

      if (existing) {
        if (existing.access === access) {
          // If same access clicked again, remove the permission
          updatedPermissions = prev.permissions.filter((p) => p.name !== name)
        } else {
          // Update access
          updatedPermissions = prev.permissions.map((p) =>
            p.name === name ? { ...p, access } : p
          )
        }
      } else {
        // Add new permission
        updatedPermissions = [...prev.permissions, { name, access }]
      }

      return {
        ...prev,
        permissions: updatedPermissions,
      }
    })
  }

  //console.log('formData permissions :>> ', formData.permissions)

  const defaultCostCentres = [
    'Gauteng Region',
    'Western Cape Region',
    'KwaZulu-Natal Region',
    'Eastern Cape Region',
    'Limpopo Region',
  ]

  const displayCostCentres =
    cost_centres.length > 0 ? cost_centres : defaultCostCentres
  //  console.log('displayCostCentres :>> ', displayCostCentres)

  // console.log(
  //   'formData.permissions.length < 0 :>> ',
  //   formData.permissions.length <= 0
  // )

  //console.log('name :>> ', !formData?.email?.includes('@'))

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {user?.id ? `Edit User` : 'Add New User'}
            </h2>
            <p className="text-muted-foreground">
              {user?.id ? user.name : 'Enter user details'}
            </p>
          </div>
        </div>

        <Tabs
          value={tabs[currentTab]?.value}
          onValueChange={(value) => {
            const index = tabs.findIndex((tab) => tab.value === value)
            setCurrentTab(index)
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-6">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                tabIndex={currentTab}
                value={tab.value}
                onClick={() => {
                  console.log('index :>> ', index)
                  setCurrentTab(index)
                }}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Basic information about this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {user?.id && (
                    <div className="space-y-2">
                      <Label htmlFor="id">ID</Label>
                      <Input
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., John"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g., Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.smith@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 82 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Operations"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g., Fleet Manager"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costCentre">Cost Centre</Label>
                    <Select
                      value={formData.costCentre}
                      onValueChange={(value) =>
                        handleSelectChange('costCentre', value)
                      }
                    >
                      <SelectTrigger id="costCentre" className={'w-full'}>
                        <SelectValue placeholder="Select cost centre" />
                      </SelectTrigger>
                      <SelectContent>
                        {cost_centres?.data?.map((centre) => {
                          //  console.log('centre :>> ', centre)
                          return (
                            <SelectItem key={centre.id} value={centre.name}>
                              {centre.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange('status', value)
                      }
                    >
                      <SelectTrigger id="status" className={'w-full'}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Input
                      id="joinDate"
                      name="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleSelectChange('role', value)
                      }
                    >
                      <SelectTrigger id="role" className={'w-full'}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-2">{getRoleBadge(formData.role)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Set user permissions and access control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Select All Buttons */}
                  <div className="mb-4 flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedPermissions = availablePermissions.map(
                          (p) => ({ name: p.name, access: 'read' })
                        )
                        setFormData((prev) => ({
                          ...prev,
                          permissions: updatedPermissions,
                        }))
                      }}
                    >
                      Select All Read
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedPermissions = availablePermissions.map(
                          (p) => ({ name: p.name, access: 'write' })
                        )
                        setFormData((prev) => ({
                          ...prev,
                          permissions: updatedPermissions,
                        }))
                      }}
                    >
                      Select All Write
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, permissions: [] }))
                      }}
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Headers */}
                  <div className="grid grid-cols-12 gap-2 mb-3 pb-2 border-b">
                    <h4 className="col-span-9 text-sm font-medium text-gray-500">
                      Permissions
                    </h4>
                    <div className="col-span-3 grid grid-cols-3 gap-2">
                      <span className="text-xs text-center font-medium text-gray-500">
                        View
                      </span>
                      <span className="text-xs text-center font-medium text-gray-500">
                        Edit
                      </span>
                      <span className="text-xs text-center font-medium text-gray-500">
                        None
                      </span>
                    </div>
                  </div>

                  {/* Permissions Grid */}
                  <div className="space-y-3">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.name}
                        className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-gray-50 rounded-md px-2"
                      >
                        <div className="col-span-9">
                          <span className="capitalize text-sm font-medium">
                            {permission.name.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="col-span-3 grid grid-cols-3 gap-2">
                          {/* View (Read) */}
                          <div className="flex justify-center">
                            <Checkbox
                              checked={
                                getPermissionAccess(permission.name) === 'read'
                              }
                              onCheckedChange={() =>
                                handlePermissionChange(permission.name, 'read')
                              }
                            />
                          </div>

                          {/* Edit (Write) */}
                          <div className="flex justify-center">
                            <Checkbox
                              checked={
                                getPermissionAccess(permission.name) === 'write'
                              }
                              onCheckedChange={() =>
                                handlePermissionChange(permission.name, 'write')
                              }
                            />
                          </div>

                          {/* None */}
                          <div className="flex justify-center">
                            <Checkbox
                              checked={
                                getPermissionAccess(permission.name) === ''
                              }
                              onCheckedChange={() =>
                                handlePermissionChange(permission.name, '')
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Managed Cost Centres
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {cost_centres?.data?.map((centre) => {
                      return (
                        <div
                          key={centre.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={centre.id}
                            checked={formData.managedCostCentres.includes(
                              centre.name
                            )}
                            onCheckedChange={() =>
                              handleCostCentreChange(centre.name)
                            }
                          />
                          <Label htmlFor={centre.id}>{centre.name}</Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              className={currentTab == 0 ? 'shadow-none' : 'shadow'}
              disabled={currentTab == 0}
              onClick={prevStep}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              type="button"
              className={currentTab == 1 ? 'shadow-none' : 'shadow'}
              disabled={currentTab == 1}
              onClick={nextStep}
            >
              <ChevronRight />
            </Button>
          </div>

          <Button
            type="submit"
            disabled={
              currentTab == 0 ||
              formData.name.length <= 3 ||
              formData.email.length < 6 ||
              !formData?.email?.includes('@') ||
              formData.permissions.length <= 0 ||
              formData.managedCostCentres.length <= 0
            }
          >
            <Save className="mr-2 h-4 w-4" /> Save User
          </Button>
        </div>
      </div>
    </form>
  )
}

export default UserForm

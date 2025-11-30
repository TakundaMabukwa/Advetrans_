// accessible routes
const routes = [
  {
    label: 'Dashboard',
    icon: 'ChartColumnBig',
    href: '/',
    color: 'text-sky-500',
    permission: null, // accessible to all authenticated users
  },
  {
    label: 'Cost Centres',
    icon: 'Building2',
    href: '/cost-centres',
    color: 'text-violet-500',
    permission: 'manage_cost_centres',
  },
  {
    label: 'Clients',
    icon: 'Building',
    href: '/clients',
    color: 'text-violet-500',
    permission: 'manage_clients',
  },
  {
    label: 'Users',
    icon: 'Users',
    href: '/users',
    color: 'text-pink-700',
    permission: 'manage_users',
  },
  {
    label: 'Vehicles',
    icon: 'Truck',
    href: '/vehicles',
    color: 'text-orange-500',
    permission: 'manage_vehicles',
  },
  {
    label: 'Drivers',
    icon: 'UserCircle',
    href: '/drivers',
    color: 'text-green-700',
    permission: 'manage_drivers',
  },
  {
    label: 'Stop Points',
    icon: 'Map',
    href: '/stop-points',
    color: 'text-blue-700',
    permission: 'manage_stop_points',
  },
  {
    label: 'Trips',
    icon: 'Route',
    href: '/trips',
    color: 'text-emerald-500',
    permission: 'manage_trips',
  },
  // {
  //   label: 'Reports',
  //   icon: 'ChartColumnBig',
  //   href: '/reports',
  //   color: 'text-blue-500',
  //   permission: 'view_reports',
  // },
  // {
  //   label: 'Jobs',
  //   icon: 'Wrench',
  //   href: '/jobs',
  //   color: 'text-yellow-500',
  //   permission: 'manage_jobs',
  // },
  // {
  //   label: 'Call Center',
  //   icon: 'Phone',
  //   href: '/callcenter',
  //   color: 'text-red-500',
  //   permission: 'manage_callcenter',
  // },
]

export const getAccessibleRoutes = (permissions) => {
  // Handle case where permissions is undefined, null, or not an array
  if (!permissions || !Array.isArray(permissions)) {
    // Return basic routes that don't require permissions or are commonly accessible
    return [
      {
        label: 'Dashboard',
        icon: 'ChartColumnBig',
        href: '/',
        color: 'text-sky-500',
        permission: null,
      },
      {
        label: 'Vehicles',
        icon: 'Truck',
        href: '/vehicles',
        color: 'text-orange-500',
        permission: null, // Make vehicles accessible by default
      },
      {
        label: 'Drivers',
        icon: 'UserCircle',
        href: '/drivers',
        color: 'text-green-700',
        permission: null, // Make drivers accessible by default
      },
      {
        label: 'Trips',
        icon: 'Route',
        href: '/trips',
        color: 'text-emerald-500',
        permission: null, // Make trips accessible by default
      },
    ]
  }

  return routes.filter((route) => {
    // Route doesn't require a permission → allow
    if (!route.permission) {
      return true
    }

    // Find the user's permission object
    const userPermission = permissions.find(
      (perm) => perm.name === route.permission
    )

    // Allow access if user has 'read' or 'write'
    return (
      userPermission?.access === 'read' || userPermission?.access === 'write'
    )
  })
}

export const getPermittedAccessRoutes = (permissions) => {
  return routes
    .map((route) => {
      if (!route.permission) return { ...route, access: 'read' } // Default for public routes

      const match = permissions.find((p) => p.name === route.permission)
      if (match?.access === 'read' || match?.access === 'write') {
        return { ...route, access: match.access }
      }

      return null
    })
    .filter(Boolean)
}

'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/context/auth-context/context'
import { useGlobalContext } from '@/context/global-context/context'

import {
  ChartColumnBig,
  Building2,
  Building,
  Users,
  Truck,
  Route,
  Map,
  UserCircle,
  ChevronDown,
  MapIcon,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const iconMap = {
  ChartColumnBig: ChartColumnBig,

  Building2: Building2,

  Building: Building,

  Users: Users,

  Truck: Truck,

  UserCircle: UserCircle,

  Map: Map,

  Route: Route,
}

const SideBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const {
    current_user: {
      currentUser: { costCentre, role, email, permissions },
      currentUser,
    },
    logout,
  } = useAuth()
  const { routes } = useGlobalContext()
  // console.log('currentUser :>> ', currentUser?.company)

  // Ensure routes is always an array
  const safeRoutes = Array.isArray(routes) ? routes : []

  return (
    <Sidebar collapsible="icon" className="z-30 ">

      <SidebarContent className="mt-3">
        <SidebarGroup>
          <SidebarMenu>
            {safeRoutes.length > 0 ? (
              safeRoutes.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                const Icon = iconMap[item.icon]
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? 'bg-gray-200' : ''}
                    >
                      <Link href={item.href}>
                        <Icon color={isActive ? '#000000' : '#333333'} />
                        <span className={isActive ? 'font-bold' : undefined}>
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })
            ) : (
              <div className="p-4 text-sm text-gray-500">
                No routes available. Loading...
              </div>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={pathname.startsWith('/routes') ? 'bg-gray-200' : ''}
              >
                <Link href={'/routes'}>
                  <MapIcon
                    color={
                      pathname.startsWith('/routes') ? '#000000' : '#333333'
                    }
                  />
                  <span
                    className={
                      pathname.startsWith('/routes') ? 'font-bold' : undefined
                    }
                  >
                    Routes
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={pathname.startsWith('/audit') ? 'bg-gray-200' : ''}
              >
                <Link href={'/audit'}>
                  <FileText
                    color={
                      pathname.startsWith('/audit') ? '#000000' : '#333333'
                    }
                  />
                  <span
                    className={
                      pathname.startsWith('/audit') ? 'font-bold' : undefined
                    }
                  >
                    Audit
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t ">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip="User Profile">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-gray-200">
                    <UserCircle className="size-5 text-gray-600" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none ">
                    <span className="font-medium capitalize">
                      {role || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
                align="start"
              >
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout(router)}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default SideBar

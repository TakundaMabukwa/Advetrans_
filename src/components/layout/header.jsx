'use client'

// next
import { useParams, usePathname } from 'next/navigation'

// context
import { useAuth } from '@/context/auth-context/context'
import { useGlobalContext } from '@/context/global-context/context'
import { getGreeting } from '@/hooks/use-greeting'

// icons
import { Bell } from 'lucide-react'

// components
import { SidebarTrigger } from '@/components/ui/sidebar-provider'

const Header = () => {
  const {
    current_user: {
      currentUser: { costCentre, name },
    },
  } = useAuth()
  const pathname = usePathname().slice(1)

  const params = useParams()
  const { cost_centres, dashboardState } = useGlobalContext()
  const allCostCentres = cost_centres?.data

  const selected_costCentre =
    dashboardState?.costCentre &&
    dashboardState?.costCentre !== 'All' &&
    dashboardState?.costCentre
  const filter_cc =
    allCostCentres.filter((cc) => cc.id == selected_costCentre)?.[0]?.name ||
    costCentre
  return (
    <div className="sticky  h-16 top-0 z-10 px-4  md:px-6 bg-gray-100 dark:bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-gray-100/60 dark:supports-[backdrop-filter]:bg-gray-900/60 flex shrink-0 justify-between items-center shadow-sm ">
      <div className=" ">
        <h2 className="text-2xl font-bold tracking-tight capitalize">
          {filter_cc}
        </h2>
      </div>

      <div className=" flex   justify-end space-x-4 items-center">
        <h2 className="text-xl font-bold tracking-tight capitalize">
          {/* {titleSection?.title} */}
          {getGreeting(name)}
        </h2>
        <Bell size={20} />
        <SidebarTrigger />
      </div>
    </div>
  )
}

export default Header

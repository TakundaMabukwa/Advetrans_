import { useParams, usePathname } from 'next/navigation'

import { useGlobalContext } from '@/context/global-context/context'

const PageTitle = () => {
  const pathname = usePathname().slice(1)

  const params = useParams()
  const {
    dashboard,
    cost_centres,
    clients,
    users,
    vehicles,
    drivers,
    stop_points,
    trips,
  } = useGlobalContext()

  let titleSection = {}

  if (pathname === '' || pathname.includes('dashboard')) {
    titleSection = dashboard.titleSection
  } else if (pathname.includes('cost-centres')) {
    if (params?.id) {
      const costCentre = cost_centres?.data.find(
        (item) => item.id === params.id
      )
      titleSection = {
        ...cost_centres?.titleSection,
        title: costCentre?.name,
        description: 'Cost Centre Details',
      }
    } else {
      titleSection = cost_centres?.titleSection
    }
    // titleSection = cost_centres.titleSection
  } else if (pathname.includes('clients')) {
    if (params?.id) {
      const client = clients?.data.find((item) => item.id === params.id)
      titleSection = {
        ...client?.titleSection,
        title: client?.name,
        description: 'Client Details',
      }
    } else {
      titleSection = clients?.titleSection
    }
  } else if (pathname.includes('users')) {
    if (params?.id) {
      const user = users.data.find((item) => item.id === params.id)
      titleSection = {
        ...users?.titleSection,
        title: user?.name,
        description: 'User Details',
      }
    } else {
      titleSection = users?.titleSection
    }
  } else if (pathname.includes('vehicles')) {
    if (params?.id) {
      const vehicle = vehicles?.data.find((item) => item.id === params.id)
      titleSection = {
        ...vehicles?.titleSection,
        title: vehicle?.model,
        description: `${vehicle?.type} • ${vehicle?.regNumber}`,
      }
    } else {
      titleSection = vehicles?.titleSection
    }
  } else if (pathname.includes('drivers')) {
    if (params?.id) {
      const driver = drivers?.data.find((item) => item.id === params.id)
      titleSection = {
        ...drivers?.titleSection,
        title: driver?.name,
        description: ` ${driver?.license} •  ${driver?.experience} years`,
      }
    } else {
      titleSection = drivers?.titleSection
    }
  } else if (pathname.includes('stop-points')) {
    if (params?.id) {
      const stopPoint = stop_points?.data.find((item) => item.id === params.id)
      titleSection = {
        ...stop_points?.titleSection,
        title: stopPoint?.name,
        description: stopPoint?.address,
      }
    } else {
      titleSection = stop_points?.titleSection
    }
  } else if (pathname.includes('trips')) {
    if (params?.id) {
      const trip = trips?.data.find((item) => item.id === params.id)

      titleSection = {
        ...trips?.titleSection,
        title: trip?.customer || trip?.id,
        description: `${trip?.id} • ${trip?.pickupLocation} - ${trip?.dropoffLocation}`,
      }
    } else {
      titleSection = trips?.titleSection
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight capitalize">
        {titleSection?.title}
      </h2>
      <p className="text-muted-foreground">{titleSection?.description}</p>
    </div>
  )
}

export default PageTitle

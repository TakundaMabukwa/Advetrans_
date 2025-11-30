'use client'

// next
import { usePathname, useRouter } from 'next/navigation'

// components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// forms

// context
import { useGlobalContext } from '@/context/global-context/context'

// hooks
import { replaceHyphenWithUnderscore } from '@/hooks/replace-hyphen'
import CountUp from '@/components/ui/count-up'
import PageLoader from '@/components/ui/loader'

import { useAuth } from '@/context/auth-context/context'
import PageTitle from '@/components/layout/page-title'
import { getPermittedAccessRoutes } from '@/hooks/get-accessible-routes'

// export const getPermittedAccessRoutes = (permissions, routes) => {
//   return routes
//     .map((route) => {
//       if (!route.permission) return { ...route, access: 'read' } // Default for public routes

//       const match = permissions.find((p) => p.name === route.permission)
//       if (match?.access === 'read' || match?.access === 'write') {
//         return { ...route, access: match.access }
//       }

//       return null
//     })
//     .filter(Boolean)
// }

const PageContainer = ({ children }) => {
  const pathname = usePathname().slice(1)
  const path = replaceHyphenWithUnderscore(pathname)
  const current_screen = useGlobalContext()[path]
  const {
    current_user: {
      currentUser: { costCentre, role, email, permissions },
    },
    logout,
  } = useAuth()
  const router = useRouter()
  const { onCreate, onEdit, onDelete, loading } = useGlobalContext()

  // console.log('current_screen :>> ', current_screen?.csv_headers)
  // console.log('csv_rows :>> ', current_screen?.csv_rows)

  const accessibleRoutes = getPermittedAccessRoutes(permissions)

  const canEdit = accessibleRoutes.filter((p) => p.href.includes(pathname))
  // console.log('canEdit :>> ', canEdit)
  // console.log('canEdit :>> ', canEdit[0]?.access !== 'write')
  return (
    <>
      {loading ? (
        <PageLoader />
      ) : (
        <div className="space-y-6 h-full overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <PageTitle />
            {current_screen?.titleSection?.button ? (
              <Button
                onClick={() => onCreate()}
                disabled={canEdit[0]?.access !== 'write' || false}
              >
                {current_screen?.titleSection.button.icon}
                {current_screen?.titleSection.button.text}
              </Button>
            ) : (
              <div className="flex gap-2">
                <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option>All Cost Centres</option>
                  <option>North Region</option>
                  <option>South Region</option>
                  <option>East Region</option>
                </select>
                <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {current_screen?.screenStats?.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center h-full justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] lg:text-[16px]  font-semibold">
                    {stat.title}
                  </CardTitle>
                  <div>{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <CountUp value={stat.value} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1">
            {current_screen?.tableInfo?.tabs ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList
                  className={`grid w-full grid-cols-${current_screen?.tableInfo?.tabs.length} gap-6`}
                >
                  {current_screen?.tableInfo?.tabs.map((trigger, index) => {
                    return (
                      <TabsTrigger key={index} value={trigger.value}>
                        <h6 className="capitalize">{trigger.title}</h6>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {current_screen?.tableInfo?.tabs?.map((content, index) => {
                  return (
                    <TabsContent
                      key={index}
                      value={content.value}
                      className="space-y-4"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>{content.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DataTable
                            columns={current_screen?.columns({
                              onEdit,
                              onDelete,
                            })}
                            data={
                              content.value == 'other'
                                ? current_screen?.data.filter(
                                    (data) =>
                                      !content.filterBy.includes(data.type)
                                  )
                                : content.filterBy
                                ? current_screen?.data?.filter((item) =>
                                    item.type
                                      ? item.type === content.filterBy
                                      : item?.status &&
                                        content.value === 'active'
                                      ? item.status === 'in-progress' ||
                                        item.status === 'delayed'
                                      : item?.status === content.filterBy
                                  )
                                : current_screen?.data
                            }
                            filterColumn={content.filterColumn}
                            filterPlaceholder={content.filterPlaceholder}
                            csv_headers={current_screen?.csv_headers}
                            csv_rows={current_screen?.csv_rows}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )
                })}
              </Tabs>
            ) : current_screen?.tableInfo ? (
              <Card>
                <CardHeader>
                  <CardTitle>{`All ${current_screen?.tableInfo.title}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={current_screen?.columns({ onEdit, onDelete })}
                    data={current_screen?.data}
                    filterColumn={current_screen?.tableInfo.filterColumn}
                    filterPlaceholder={
                      current_screen?.tableInfo.filterPlaceholder
                    }
                    csv_headers={current_screen?.csv_headers}
                    csv_rows={current_screen?.csv_rows}
                    href=""
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}

export default PageContainer

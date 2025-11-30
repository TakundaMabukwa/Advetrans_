'use client'
// components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useGlobalContext } from '@/context/global-context/context'
import { replaceHyphenWithUnderscore } from '@/hooks/replace-hyphen'
import { useToast } from '@/hooks/use-toast'
import { usePathname } from 'next/navigation'

const AlertScreen = ({ alertOpen, setAlertOpen, id }) => {
  const pathname = usePathname().slice(1)
  const screen = replaceHyphenWithUnderscore(pathname)
  const { toast } = useToast()
  const {
    cc_api,
    costCentresDispatch,
    c_api,
    clientsDispatch,
    u_api,
    usersDispatch,
    v_api,
    vehiclesDispatch,
    d_api,
    driversDispatch,
    sp_api,
    stopPointsDispatch,
    t_api,
    tripsDispatch,
  } = useGlobalContext()
  let deleteItem = null
  let dispatch = null

  switch (screen) {
    case 'cost_centres':
      deleteItem = cc_api.deleteCostCentre
      dispatch = costCentresDispatch
      break

    case 'clients':
      deleteItem = c_api.deleteClient
      dispatch = clientsDispatch
      break

    case 'users':
      deleteItem = u_api.deleteUser
      dispatch = usersDispatch
      break

    case 'vehicles':
      deleteItem = v_api.deleteVehicle
      dispatch = vehiclesDispatch
      break

    case 'drivers':
      deleteItem = d_api.deleteDriver
      dispatch = driversDispatch
      break

    case 'stop_points':
      deleteItem = sp_api.deleteStopPoint
      dispatch = stopPointsDispatch
      break

    case 'trips':
      deleteItem = t_api.deleteTrip
      dispatch = tripsDispatch
      break

    default:
      deleteItem = null
      break
  }

  const handleDelete = async () => {
    const readableScreen = pathname.replace(/-/g, ' ')

    if (!deleteItem || !dispatch) {
      toast({
        title: 'Error deleting item',
        description: 'This item cannot be deleted from this screen.',
      })
      return
    }

    try {
      await deleteItem(id, dispatch)
      toast({
        title: `${readableScreen} ${id} was deleted successfully`,
      })
    } catch (error) {
      toast({
        title: `Error deleting ${readableScreen} ${id}`,
        description: error.message,
      })
    }
  }

  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to remove item with id {id} from {screen} data This
            action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AlertScreen

'use client'

// next
import { usePathname } from 'next/navigation'

// components
import DriverForm from '@/components/forms/driver-form'
import StopPointForm from '@/components/forms/stop-point-form'
import TripForm from '@/components/forms/trip-form'
import UserForm from '@/components/forms/user-form'
import VehicleForm from '@/components/forms/vehicle-form'
import CostCentreForm from '@/components/forms/cost-centre-form'
import { ClientForm } from '@/components/forms/client-form'

// shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

// hooks
import { replaceHyphenWithUnderscore } from '@/hooks/replace-hyphen'

const DialogScreen = ({ open, onOpenChange, id, href }) => {
  // const pathname = usePathname().slice(1)
  const pathname = href ? href : usePathname().split('/')[1]
  const screen = replaceHyphenWithUnderscore(pathname)
  //  console.log('href :>> ', href)
  //  console.log('screen :>> ', screen)
  const Modal = ({ children }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogHeader>
        <DialogTitle>sss</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader> */}

      <DialogContent className="min-w-[60%] h-[90vh]  overflow-y-scroll pt-10 border-r-2 ">
        {children}
      </DialogContent>
    </Dialog>
  )

  switch (screen) {
    case 'cost_centres':
      return (
        <Modal>
          <CostCentreForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    case 'clients':
      return (
        <Modal>
          <ClientForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    case 'users':
      return (
        <Modal>
          <UserForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    case 'vehicles':
      return (
        <Modal>
          <VehicleForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    case 'drivers':
      return (
        <Modal>
          <DriverForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    case 'stop_points':
      return (
        <Modal>
          <StopPointForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    case 'trips':
      return (
        <Modal>
          <TripForm
            screen={screen}
            id={id}
            open={open}
            onCancel={() => onOpenChange()}
          />
        </Modal>
      )

    default:
      return (
        <Modal>
          <DialogDescription>Dialog form space</DialogDescription>
        </Modal>
      )
  }
}
export default DialogScreen

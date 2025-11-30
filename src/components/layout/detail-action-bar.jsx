import { ArrowLeft, Edit } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

// components
import { Button } from '@/components/ui/button'

// context
import { useGlobalContext } from '@/context/global-context/context'
import { useAuth } from '@/context/auth-context/context'

// hooks
import { getPermittedAccessRoutes } from '@/hooks/get-accessible-routes'

const DetailActionBar = ({ id, title, description }) => {
  const pathname = usePathname().split('/')[1]

  console.log('pathname :>> ', pathname)
  const router = useRouter()
  const { onEdit, routes } = useGlobalContext()

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
      <div className="flex items-center gap-4 ">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight capitalize">
            {title ? title : id}
          </h2>
          <p className="text-muted-foreground">{description || null}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onEdit({ id })}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        {/* <Button variant="destructive" onClick={() => onDelete({ id })}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button> */}
      </div>
    </div>
  )
}

export default DetailActionBar

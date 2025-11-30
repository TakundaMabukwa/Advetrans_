"use client"

import { usePermissions } from '@/hooks/usePermissions'
import { PageKey, ActionKey } from '@/lib/permissions/permissions'

interface PermissionGuardProps {
  page: PageKey
  action?: ActionKey
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  page, 
  action = 'view', 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { canAccess } = usePermissions()

  if (!canAccess(page, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component version
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  page: PageKey,
  action: ActionKey = 'view'
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard page={page} action={action}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}
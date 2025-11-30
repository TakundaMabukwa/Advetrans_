"use client"

import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/PermissionGuard'
import { PageKey, ActionKey } from '@/lib/permissions/permissions'

interface SecureButtonProps {
  page: PageKey
  action: ActionKey
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
}

export function SecureButton({ 
  page, 
  action, 
  children, 
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled = false
}: SecureButtonProps) {
  return (
    <PermissionGuard page={page} action={action}>
      <Button 
        onClick={onClick}
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
      >
        {children}
      </Button>
    </PermissionGuard>
  )
}
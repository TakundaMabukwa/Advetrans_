"use client"

import * as React from "react"
import { X } from "lucide-react"

interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: "success" | "error"
  children: React.ReactNode
}

export function Toast({ open, onOpenChange, variant, children }: ToastProps) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [open, onOpenChange])

  if (!open) return null

  const baseClasses = "fixed top-4 right-4 z-50 flex items-center justify-between p-4 rounded-md shadow-lg border transition-all duration-300 min-w-[300px]"
  const variantClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-gradient-to-r from-red-50 to-white border-red-200 text-red-600"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex-1">{children}</div>
      <button
        onClick={() => onOpenChange(false)}
        className="ml-4 p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-semibold text-sm">{children}</div>
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
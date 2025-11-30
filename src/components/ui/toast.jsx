"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toast({ message, type = 'success', isVisible, onClose, duration = 4000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg shadow-lg border max-w-md",
        type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
      )}>
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false })

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return { toast, showToast, hideToast }
}
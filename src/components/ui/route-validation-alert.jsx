'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, X } from 'lucide-react'

export default function RouteValidationAlert({ violations, onClose }) {
  if (!violations || violations.length === 0) return null

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <div className="flex justify-between items-start w-full">
        <div className="flex-1">
          <AlertTitle className="text-red-800">
            Route passes through {violations.length} high-risk area{violations.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-red-700 mt-2">
            <div className="space-y-2">
              {violations.map((violation, index) => (
                <div key={index} className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">{violation.areaName}</span>
                  <Badge variant="destructive" className="text-xs">
                    High Risk
                  </Badge>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm">
              Consider selecting an alternative route to avoid these areas.
            </p>
          </AlertDescription>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  )
}
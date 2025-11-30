"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Building2 } from 'lucide-react'

export function ClientAddressPopup({ 
  isOpen, 
  onClose, 
  client, 
  onUseAsPickup, 
  onUseAsDropoff, 
  onSkip 
}) {
  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Use Client Address
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">{client.name}</p>
                <p className="text-sm text-slate-600 mt-1">{client.address}</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-600">
            Would you like to use this client's address as a location for this trip?
          </p>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onUseAsPickup}
              className="w-full justify-start"
              variant="outline"
            >
              <MapPin className="h-4 w-4 mr-2 text-green-600" />
              Use as Loading Location
            </Button>
            
            <Button 
              onClick={onUseAsDropoff}
              className="w-full justify-start"
              variant="outline"
            >
              <MapPin className="h-4 w-4 mr-2 text-red-600" />
              Use as Drop-off Location
            </Button>
            
            <Button 
              onClick={onSkip}
              variant="ghost"
              className="w-full"
            >
              Skip - I'll enter manually
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
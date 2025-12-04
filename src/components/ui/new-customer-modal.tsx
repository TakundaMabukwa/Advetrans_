"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Plus, X, Map } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { geocodeWithRules } from '@/lib/geocoding-rules'

interface NewCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customerName: string
  customerId: string
  initialLocation?: string
  onCustomerCreated: (customer: any) => void
}

const ZONES = [
  'Cape Town CBD',
  'Northern Suburbs',
  'Southern Suburbs',
  'Cape Flats',
  'West Coast',
  'Boland',
  'Garden Route',
  'Johannesburg',
  'Pretoria',
  'Durban',
  'Port Elizabeth',
  'Other'
]

const detectZoneFromLocation = (placeName: string, context: any[]): string => {
  const lower = placeName.toLowerCase()
  
  // Extract suburb/locality from context
  const locality = context?.find(c => c.id?.includes('locality') || c.id?.includes('place'))?.text?.toLowerCase() || ''
  const region = context?.find(c => c.id?.includes('region'))?.text?.toLowerCase() || ''
  
  // Cape Town regions
  if (lower.includes('cape town') || region.includes('western cape')) {
    if (locality.match(/bellville|durbanville|parow|goodwood|brackenfell|kraaifontein|kuils river/)) return 'Northern Suburbs'
    if (locality.match(/wynberg|claremont|rondebosch|newlands|constantia|tokai|fish hoek|muizenberg/)) return 'Southern Suburbs'
    if (locality.match(/mitchells plain|khayelitsha|athlone|grassy park|philippi/)) return 'Cape Flats'
    if (locality.match(/city bowl|cbd|foreshore|gardens|tamboerskloof|woodstock|salt river/)) return 'Cape Town CBD'
    if (locality.match(/malmesbury|saldanha|langebaan|vredenburg/)) return 'West Coast'
    if (locality.match(/paarl|stellenbosch|worcester|wellington|franschhoek/)) return 'Boland'
  }
  
  // Other major cities
  if (lower.includes('johannesburg') || locality.includes('johannesburg')) return 'Johannesburg'
  if (lower.includes('pretoria') || locality.includes('pretoria') || locality.includes('tshwane')) return 'Pretoria'
  if (lower.includes('durban') || locality.includes('durban') || region.includes('kwazulu')) return 'Durban'
  if (lower.includes('port elizabeth') || lower.includes('gqeberha') || locality.includes('port elizabeth')) return 'Port Elizabeth'
  if (lower.match(/george|knysna|plettenberg|mossel bay/)) return 'Garden Route'
  
  return 'Other'
}

export function NewCustomerModal({ isOpen, onClose, customerName, customerId, initialLocation, onCustomerCreated }: NewCustomerModalProps) {
  const supabase = createClient()
  const [zone, setZone] = useState('')
  const [address, setAddress] = useState(initialLocation || '')
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [newRestriction, setNewRestriction] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Auto-fill location when modal opens
  React.useEffect(() => {
    if (isOpen && initialLocation) {
      setZone('')
      setAddress(initialLocation)
      setSelectedCoords(null)
      setRestrictions([])
      setAddressSuggestions([])
      setNewRestriction('')
      
      // Auto-search with Western Cape priority
      handleAddressChange(initialLocation)
    }
  }, [customerId, isOpen])

  const handleAddressChange = async (value: string) => {
    setAddress(value)
    
    if (value.length < 3) {
      setAddressSuggestions([])
      return
    }

    setIsGeocoding(true)
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!mapboxToken) return

      // Prioritize Western Cape regions
      const westernCapeQuery = `${value}, Western Cape, South Africa`
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(westernCapeQuery)}.json?access_token=${mapboxToken}&country=za&proximity=-33.9249,18.4241&limit=8`
      )
      const data = await response.json()
      
      // Sort results to prioritize Western Cape
      const suggestions = (data.features || []).sort((a: any, b: any) => {
        const aWC = a.place_name.toLowerCase().includes('western cape')
        const bWC = b.place_name.toLowerCase().includes('western cape')
        if (aWC && !bWC) return -1
        if (!aWC && bWC) return 1
        return 0
      })
      
      setAddressSuggestions(suggestions)
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSelectAddress = async (feature: any) => {
    setAddress(feature.place_name)
    setSelectedCoords({
      lat: feature.center[1],
      lng: feature.center[0]
    })
    
    // Use proper geocoding rules to get accurate zone
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (mapboxToken) {
        const geocodeResult = await geocodeWithRules(customerName, feature.place_name, mapboxToken)
        if (geocodeResult) {
          setZone(geocodeResult.location_group)
        } else {
          // Fallback to old detection method
          const detectedZone = detectZoneFromLocation(feature.place_name, feature.context || [])
          setZone(detectedZone)
        }
      } else {
        // Fallback to old detection method
        const detectedZone = detectZoneFromLocation(feature.place_name, feature.context || [])
        setZone(detectedZone)
      }
    } catch (error) {
      console.error('Error geocoding with rules:', error)
      // Fallback to old detection method
      const detectedZone = detectZoneFromLocation(feature.place_name, feature.context || [])
      setZone(detectedZone)
    }
    
    setAddressSuggestions([])
  }

  const handleAddRestriction = () => {
    if (newRestriction.trim() && !restrictions.includes(newRestriction.trim())) {
      setRestrictions([...restrictions, newRestriction.trim()])
      setNewRestriction('')
    }
  }

  const handleRemoveRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!address || !selectedCoords) {
      toast.error('Please select an address from suggestions')
      return
    }

    setIsSaving(true)
    try {
      // Determine proper region based on zone
      let region = 'Other'
      if (zone.includes('Cape Town') || zone.includes('Boland') || zone.includes('West Coast') || zone.includes('Overberg') || zone.includes('Garden Route')) {
        region = 'Western Cape'
      } else if (zone.includes('Johannesburg') || zone.includes('Pretoria')) {
        region = 'Gauteng'
      } else if (zone.includes('Durban')) {
        region = 'KwaZulu-Natal'
      } else if (zone.includes('Port Elizabeth')) {
        region = 'Eastern Cape'
      }

      // Get municipality from last geocoding result or use zone as fallback
      let municipality = zone
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (mapboxToken) {
          const geocodeResult = await geocodeWithRules(customerName, address, mapboxToken)
          if (geocodeResult?.municipality) {
            municipality = geocodeResult.municipality
          }
        }
      } catch (error) {
        console.log('Using zone as municipality fallback')
      }

      const customerData = {
        customer_id: customerId,
        customer_name: customerName,
        zone,
        municipality,
        region,
        address,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        restrictions: restrictions
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error

      // Reset form for next customer
      setZone('')
      setAddress('')
      setSelectedCoords(null)
      setRestrictions([])
      setAddressSuggestions([])
      
      onCustomerCreated(data)
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Failed to save customer')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            New Customer Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Customer: {customerName}</p>
            <p className="text-xs text-blue-700">ID: {customerId}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Search Location *</Label>
            <p className="text-xs text-gray-500 mb-1">Enter location from "Location of the ship-to party" field</p>
            <div className="relative">
              <Input
                id="address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Customer Name, Location"
                className="pr-10"
              />
              {isGeocoding && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            {addressSuggestions.length > 0 && (
              <div className="border rounded-lg shadow-lg bg-white max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAddress(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                  >
                    <p className="font-medium text-sm">{suggestion.place_name}</p>
                    <p className="text-xs text-gray-500">{suggestion.place_type?.join(', ')}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedCoords && (
              <>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <MapPin className="h-3 w-3" />
                  <span>Location confirmed: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}</span>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-gray-100 mt-3">
                  <div className="bg-gray-800 px-3 py-2 flex items-center gap-2">
                    <Map className="h-4 w-4 text-white" />
                    <span className="text-xs font-medium text-white">Location Preview</span>
                  </div>
                  <div className="relative" style={{ height: '200px' }}>
                    <img
                      src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${selectedCoords.lng},${selectedCoords.lat})/${selectedCoords.lng},${selectedCoords.lat},14,0/400x200@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                      alt="Location preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Restrictions / Rules</Label>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                placeholder="e.g., No deliveries after 4pm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRestriction()}
              />
              <Button type="button" onClick={handleAddRestriction} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {restrictions.length > 0 && (
              <div className="space-y-2 mt-3">
                {restrictions.map((restriction, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border">
                    <span className="text-sm">{restriction}</span>
                    <button
                      onClick={() => handleRemoveRestriction(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !address || !selectedCoords}>
              {isSaving ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

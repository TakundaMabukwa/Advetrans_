'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { useGlobalContext } from '@/context/global-context/context'

export function LocationsSection({
  formData,
  handlePickupLocationChange,
  addPickupLocation,
  removePickupLocation,
  handleDropoffLocationChange,
  addDropoffLocation,
  removeDropoffLocation,
  handleStopPointChange,
  clients,
}) {
  const { stop_points } = useGlobalContext()

  // Only show locations from the selected client, parsing JSON fields if needed
  const getSelectedClient = () => {
    if (formData.selectedClient && formData.selectedClient !== 'new') {
      return (
        clients?.find((client) => client.id === formData.selectedClient) ||
        null
      )
    }
    return null
  }

  const selectedClient = getSelectedClient()

  // Parse pickup_locations and dropoff_locations if they are JSON strings
  let pickupLocations = []
  let dropoffLocations = []
  if (selectedClient) {
    if (typeof selectedClient.pickupLocations === 'string') {
      try {
        pickupLocations = JSON.parse(selectedClient.pickupLocations)
      } catch {
        pickupLocations = []
      }
    } else if (Array.isArray(selectedClient.pickupLocations)) {
      pickupLocations = selectedClient.pickupLocations
    }
    if (typeof selectedClient.pickup_locations === 'string') {
      try {
        pickupLocations = JSON.parse(selectedClient.pickup_locations)
      } catch {
        // ignore
      }
    }

    if (typeof selectedClient.dropoffLocations === 'string') {
      try {
        dropoffLocations = JSON.parse(selectedClient.dropoffLocations)
      } catch {
        dropoffLocations = []
      }
    } else if (Array.isArray(selectedClient.dropoffLocations)) {
      dropoffLocations = selectedClient.dropoffLocations
    }
    if (typeof selectedClient.dropoff_locations === 'string') {
      try {
        dropoffLocations = JSON.parse(selectedClient.dropoff_locations)
      } catch {
        // ignore
      }
    }
  }

  // Handle pickup location selection from client data
  const handlePickupLocationSelect = (index, locationId) => {
    const allPickupLocations = pickupLocations
    const selectedLocation = allPickupLocations.find(
      (loc) => loc.id === locationId
    )

    if (selectedLocation) {
      handlePickupLocationChange(index, 'location', selectedLocation.name)
      handlePickupLocationChange(
        index,
        'address',
        selectedLocation.address || ''
      )
      handlePickupLocationChange(
        index,
        'contactPerson',
        selectedLocation.contactPerson || ''
      )
      handlePickupLocationChange(
        index,
        'contactNumber',
        selectedLocation.contactNumber || ''
      )
      handlePickupLocationChange(
        index,
        'operatingHours',
        selectedLocation.operatingHours || ''
      )
    }
  }

  // Handle dropoff location selection from client data
  const handleDropoffLocationSelect = (index, locationId) => {
    const allDropoffLocations = dropoffLocations
    const selectedLocation = allDropoffLocations.find(
      (loc) => loc.id === locationId
    )

    if (selectedLocation) {
      handleDropoffLocationChange(index, 'location', selectedLocation.name)
      handleDropoffLocationChange(
        index,
        'address',
        selectedLocation.address || ''
      )
      handleDropoffLocationChange(
        index,
        'contactPerson',
        selectedLocation.contactPerson || ''
      )
      handleDropoffLocationChange(
        index,
        'contactNumber',
        selectedLocation.contactNumber || ''
      )
      handleDropoffLocationChange(
        index,
        'operatingHours',
        selectedLocation.operatingHours || ''
      )
    }
  }

  // Handle stop point field change
  const handleStopPointFieldChange = (index, field, value) => {
    const updatedStopPoints = [...(formData.stopPoints || [])]
    updatedStopPoints[index] = { ...updatedStopPoints[index], [field]: value }
    if (handleStopPointChange) {
      handleStopPointChange(updatedStopPoints)
    }
  }

  // Handle stop point selection from stop points data
  const handleStopPointSelect = (index, stopPointId) => {
    const selectedStopPoint = stop_points?.data?.find(
      (sp) => sp.id === stopPointId
    )

    if (selectedStopPoint) {
      const updatedStopPoints = [...(formData.stopPoints || [])]
      updatedStopPoints[index] = {
        ...updatedStopPoints[index],
        name: selectedStopPoint.name,
        address: selectedStopPoint.address || '',
        contactPerson: selectedStopPoint.contactPerson || '',
        contactNumber: selectedStopPoint.contactNumber || '',
        operatingHours: selectedStopPoint.operatingHours || '',
      }
      if (handleStopPointChange) {
        handleStopPointChange(updatedStopPoints)
      }
    }
  }

  // Add stop point
  const addStopPoint = () => {
    const newStopPoint = {
      name: '',
      address: '',
      contactPerson: '',
      contactNumber: '',
      operatingHours: '',
      scheduledTime: '',
      notes: '',
    }
    const updatedStopPoints = [...(formData.stopPoints || []), newStopPoint]
    if (handleStopPointChange) {
      handleStopPointChange(updatedStopPoints)
    }
  }

  // Remove stop point
  const removeStopPoint = (index) => {
    const updatedStopPoints = [...(formData.stopPoints || [])]
    updatedStopPoints.splice(index, 1)
    const finalStopPoints =
      updatedStopPoints.length > 0
        ? updatedStopPoints
        : [
          {
            name: '',
            address: '',
            contactPerson: '',
            contactNumber: '',
            operatingHours: '',
            scheduledTime: '',
            notes: '',
          },
        ]
    if (handleStopPointChange) {
      handleStopPointChange(finalStopPoints)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pickup Locations</CardTitle>
          <CardDescription>Add pickup locations for this trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.pickupLocations.map((location, index) => (
            <div key={`pickup-${index}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-2 py-1">
                  Pickup Location {index + 1}
                </Badge>
                {formData.pickupLocations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePickupLocation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`pickup-location-select-${index}`}>
                    Select from Client Locations
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handlePickupLocationSelect(index, value)
                    }
                  >
                    <SelectTrigger
                      id={`pickup-location-select-${index}`}
                      className="w-full border-[#d3d3d3]"
                    >
                      <SelectValue placeholder="Select client pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`pickup-location-${index}`}>
                    Location Name
                  </Label>
                  <Input
                    id={`pickup-location-${index}`}
                    value={location.location}
                    onChange={(e) =>
                      handlePickupLocationChange(
                        index,
                        'location',
                        e.target.value
                      )
                    }
                    placeholder="Enter location name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`pickup-address-${index}`}>Address</Label>
                <Textarea
                  id={`pickup-address-${index}`}
                  value={location.address || ''}
                  onChange={(e) =>
                    handlePickupLocationChange(index, 'address', e.target.value)
                  }
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`pickup-contact-person-${index}`}>
                    Contact Person
                  </Label>
                  <Input
                    id={`pickup-contact-person-${index}`}
                    value={location.contactPerson || ''}
                    onChange={(e) =>
                      handlePickupLocationChange(
                        index,
                        'contactPerson',
                        e.target.value
                      )
                    }
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`pickup-contact-number-${index}`}>
                    Contact Number
                  </Label>
                  <Input
                    id={`pickup-contact-number-${index}`}
                    value={location.contactNumber || ''}
                    onChange={(e) =>
                      handlePickupLocationChange(
                        index,
                        'contactNumber',
                        e.target.value
                      )
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`pickup-operating-hours-${index}`}>
                    Operating Hours
                  </Label>
                  <Input
                    id={`pickup-operating-hours-${index}`}
                    value={location.operatingHours || ''}
                    onChange={(e) =>
                      handlePickupLocationChange(
                        index,
                        'operatingHours',
                        e.target.value
                      )
                    }
                    placeholder="e.g., 8:00 AM - 5:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`pickup-time-${index}`}>Scheduled Time</Label>
                <Input
                  id={`pickup-time-${index}`}
                  type="datetime-local"
                  value={location.scheduledTime}
                  onChange={(e) =>
                    handlePickupLocationChange(
                      index,
                      'scheduledTime',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`pickup-notes-${index}`}>Notes</Label>
                <Textarea
                  id={`pickup-notes-${index}`}
                  value={location.notes}
                  onChange={(e) =>
                    handlePickupLocationChange(index, 'notes', e.target.value)
                  }
                  placeholder="Additional information about this pickup"
                  rows={2}
                />
              </div>

              {index < formData.pickupLocations.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addPickupLocation}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Pickup Location
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dropoff Locations</CardTitle>
          <CardDescription>Add dropoff locations for this trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.dropoffLocations.map((location, index) => (
            <div key={`dropoff-${index}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-2 py-1">
                  Dropoff Location {index + 1}
                </Badge>
                {formData.dropoffLocations.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDropoffLocation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`dropoff-location-select-${index}`}>
                    Select from Client Locations
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleDropoffLocationSelect(index, value)
                    }
                  >
                    <SelectTrigger id={`dropoff-location-select-${index}`}>
                      <SelectValue placeholder="Select client dropoff location" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropoffLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dropoff-location-${index}`}>
                    Location Name
                  </Label>
                  <Input
                    id={`dropoff-location-${index}`}
                    value={location.location}
                    onChange={(e) =>
                      handleDropoffLocationChange(
                        index,
                        'location',
                        e.target.value
                      )
                    }
                    placeholder="Enter location name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`dropoff-address-${index}`}>Address</Label>
                <Textarea
                  id={`dropoff-address-${index}`}
                  value={location.address || ''}
                  onChange={(e) =>
                    handleDropoffLocationChange(
                      index,
                      'address',
                      e.target.value
                    )
                  }
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`dropoff-contact-person-${index}`}>
                    Contact Person
                  </Label>
                  <Input
                    id={`dropoff-contact-person-${index}`}
                    value={location.contactPerson || ''}
                    onChange={(e) =>
                      handleDropoffLocationChange(
                        index,
                        'contactPerson',
                        e.target.value
                      )
                    }
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dropoff-contact-number-${index}`}>
                    Contact Number
                  </Label>
                  <Input
                    id={`dropoff-contact-number-${index}`}
                    value={location.contactNumber || ''}
                    onChange={(e) =>
                      handleDropoffLocationChange(
                        index,
                        'contactNumber',
                        e.target.value
                      )
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dropoff-operating-hours-${index}`}>
                    Operating Hours
                  </Label>
                  <Input
                    id={`dropoff-operating-hours-${index}`}
                    value={location.operatingHours || ''}
                    onChange={(e) =>
                      handleDropoffLocationChange(
                        index,
                        'operatingHours',
                        e.target.value
                      )
                    }
                    placeholder="e.g., 8:00 AM - 5:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`dropoff-time-${index}`}>Scheduled Time</Label>
                <Input
                  id={`dropoff-time-${index}`}
                  type="datetime-local"
                  value={location.scheduledTime}
                  onChange={(e) =>
                    handleDropoffLocationChange(
                      index,
                      'scheduledTime',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`dropoff-notes-${index}`}>Notes</Label>
                <Textarea
                  id={`dropoff-notes-${index}`}
                  value={location.notes}
                  onChange={(e) =>
                    handleDropoffLocationChange(index, 'notes', e.target.value)
                  }
                  placeholder="Additional information about this dropoff"
                  rows={2}
                />
              </div>

              {index < formData.dropoffLocations.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addDropoffLocation}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Dropoff Location
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stop Points</CardTitle>
          <CardDescription>Add stop points for this trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.stopPoints?.map((stopPoint, index) => (
            <div key={`stop-point-${index}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-2 py-1">
                  Stop Point {index + 1}
                </Badge>
                {formData.stopPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStopPoint(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`stop-point-select-${index}`}>
                    Select from Stop Points
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleStopPointSelect(index, value)
                    }
                  >
                    <SelectTrigger
                      id={`stop-point-select-${index}`}
                      className="w-full border-[#d3d3d3]"
                    >
                      <SelectValue placeholder="Select stop point" />
                    </SelectTrigger>
                    <SelectContent>
                      {stop_points?.data?.map((stopPoint) => (
                        <SelectItem key={stopPoint.id} value={stopPoint.id}>
                          {stopPoint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`stop-point-name-${index}`}>
                    Stop Point Name
                  </Label>
                  <Input
                    id={`stop-point-name-${index}`}
                    value={stopPoint.name || ''}
                    onChange={(e) =>
                      handleStopPointFieldChange(index, 'name', e.target.value)
                    }
                    placeholder="Enter stop point name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stop-point-address-${index}`}>Address</Label>
                <Textarea
                  id={`stop-point-address-${index}`}
                  value={stopPoint.address || ''}
                  onChange={(e) =>
                    handleStopPointFieldChange(index, 'address', e.target.value)
                  }
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`stop-point-contact-person-${index}`}>
                    Contact Person
                  </Label>
                  <Input
                    id={`stop-point-contact-person-${index}`}
                    value={stopPoint.contactPerson || ''}
                    onChange={(e) =>
                      handleStopPointFieldChange(
                        index,
                        'contactPerson',
                        e.target.value
                      )
                    }
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`stop-point-contact-number-${index}`}>
                    Contact Number
                  </Label>
                  <Input
                    id={`stop-point-contact-number-${index}`}
                    value={stopPoint.contactNumber || ''}
                    onChange={(e) =>
                      handleStopPointFieldChange(
                        index,
                        'contactNumber',
                        e.target.value
                      )
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`stop-point-operating-hours-${index}`}>
                    Operating Hours
                  </Label>
                  <Input
                    id={`stop-point-operating-hours-${index}`}
                    value={stopPoint.operatingHours || ''}
                    onChange={(e) =>
                      handleStopPointFieldChange(
                        index,
                        'operatingHours',
                        e.target.value
                      )
                    }
                    placeholder="e.g., 8:00 AM - 5:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stop-point-time-${index}`}>
                  Scheduled Time
                </Label>
                <Input
                  id={`stop-point-time-${index}`}
                  type="datetime-local"
                  value={stopPoint.scheduledTime || ''}
                  onChange={(e) =>
                    handleStopPointFieldChange(
                      index,
                      'scheduledTime',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`stop-point-notes-${index}`}>Notes</Label>
                <Textarea
                  id={`stop-point-notes-${index}`}
                  value={stopPoint.notes || ''}
                  onChange={(e) =>
                    handleStopPointFieldChange(index, 'notes', e.target.value)
                  }
                  placeholder="Additional information about this stop point"
                  rows={2}
                />
              </div>

              {index < formData.stopPoints.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={addStopPoint}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Stop Point
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
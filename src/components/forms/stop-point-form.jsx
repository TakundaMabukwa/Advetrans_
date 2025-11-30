'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// import * as api from '@/context/stop-points-context/api'
import { useGlobalContext } from '@/context/global-context/context'
import DetailCard from '../ui/detail-card'
import DynamicInput from '../ui/dynamic-input'
import { getLatLngFromAddress } from '@/hooks/get-coords'

// Function to get type badge for preview
const getTypeBadge = (type) => {
  switch (type) {
    case 'warehouse':
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
        >
          Warehouse
        </Badge>
      )
    case 'distribution':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
        >
          Distribution
        </Badge>
      )
    case 'hub':
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800"
        >
          Hub
        </Badge>
      )
    case 'loading':
      return (
        <Badge
          variant="outline"
          className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800"
        >
          Loading
        </Badge>
      )
    case 'transit':
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800"
        >
          Transit
        </Badge>
      )
    default:
      return <Badge>{type}</Badge>
  }
}

const StopPointForm = ({ onCancel, id }) => {
  const { stop_points, stopPointsDispatch } = useGlobalContext()
  const stopPoint = stop_points.data.find((sp) => sp.id === id)

  const [formData, setFormData] = useState({
    id: stopPoint?.id || '',
    name: stopPoint?.name || '',
    type: stopPoint?.type || 'warehouse',
    address: stopPoint?.address || '',
    street: stopPoint?.street || '',
    city: stopPoint?.city || '',
    state: stopPoint?.state || '',
    country: stopPoint?.country || '',
    coords: stopPoint?.coords || '',
    coordinates: stopPoint?.coordinates || '',
    contactPerson: stopPoint?.contactPerson || '',
    contactPhone: stopPoint?.contactPhone || '',
    contactEmail: stopPoint?.contactEmail || '',
    operatingHours: stopPoint?.operatingHours || '',
    capacity: stopPoint?.capacity || '',
    notes: stopPoint?.notes || '',
    facilities: stopPoint?.facilities || [],
  })

  useEffect(() => {
    if (
      formData.street &&
      formData.city &&
      formData.state &&
      formData.country
    ) {
      getLatLngFromAddress(formData).then((coords) => {
        setFormData((prev) => ({ ...prev, coords }))
      })
    }
  }, [formData.street, formData.city, formData.state, formData.country])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const onSubmit = (data) => {
    // api.upsertStopPoints(id, data, stopPointsDispatch)
    onCancel()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const stop_point_details = [
    {
      htmlFor: 'id',
      label: 'ID',
      value: formData.id,
      required: false,
      readOnly: true,
    },
    {
      htmlFor: 'name',
      label: 'Name *',
      value: formData.name,
      placeholder: 'e.g., Main Warehouse',
      required: true,
    },
    {
      htmlFor: 'type',
      label: 'Type *',
      value: formData.type,
      placeholder: 'Select type',
    },
    {
      htmlFor: 'operatingHours',
      label: 'Operating Hours',
      value: formData.operatingHours,
      placeholder: 'e.g., Mon-Fri: 8AM-5PM',
    },
  ]

  const contact_details = [
    {
      htmlFor: 'contactPerson',
      label: 'Contact Person',
      value: formData.contactPerson,
      placeholder: 'e.g., John Smith',
      required: false,
    },
    {
      htmlFor: 'contactPhone',
      label: 'Contact Phone',
      value: formData.contactPhone,
      placeholder: '+27 11 123 4567',
      required: false,
    },
    {
      htmlFor: 'contactEmail',
      label: 'Contact Email',
      value: formData.contactEmail,
      placeholder: 'contact@warehouse.com',
    },
  ]
  const address_details = [
    {
      htmlFor: 'street',
      label: 'Street *',
      value: formData.street,
      placeholder: 'e.g., 123 Business Park',
      required: true,
    },
    {
      htmlFor: 'city',
      label: 'City *',
      value: formData.city,
      placeholder: 'e.g., Johannesburg',
      required: true,
    },
    {
      htmlFor: 'state',
      label: 'State *',
      value: formData.state,
      placeholder: 'e.g., Gauteng',
      required: true,
    },
    {
      htmlFor: 'country',
      label: 'Country *',
      value: formData.country,
      placeholder: 'e.g., South Africa',
      required: true,
    },
    {
      htmlFor: 'latitude',
      label: 'Latitude',
      value: formData.coords?.lat || '',
      placeholder: 'e.g., -26.2041',
      required: false,
      readOnly: true,
    },
    {
      htmlFor: 'longitude',
      label: 'Longitude',
      value: formData.coords?.lng || '',
      placeholder: 'e.g., 28.0473',
      required: false,
      readOnly: true,
    },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {stopPoint?.id ? `Edit Stop Point` : 'Add New Stop Point'}
            </h2>
            <p className="text-muted-foreground">
              {stopPoint?.id ? stopPoint.name : 'Enter Stop Point Details'}
            </p>
          </div>
        </div>

        <DetailCard
          title="Stop Point Information"
          description="Enter details about this location"
        >
          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stopPoint?.id && (
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  readOnly
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Main Warehouse"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="distribution">Distribution</SelectItem>
                  <SelectItem value="hub">Hub</SelectItem>
                  <SelectItem value="loading">Loading</SelectItem>
                  <SelectItem value="transit">Transit</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">{getTypeBadge(formData.type)}</div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Industrial Park, Johannesburg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinates">Coordinates</Label>
              <Input
                id="coordinates"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleChange}
                placeholder="e.g., -26.2041, 28.0473"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+27 11 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@warehouse.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingHours">Operating Hours</Label>
              <Input
                id="operatingHours"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                placeholder="e.g., Mon-Fri: 8AM-5PM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 500 pallets"
              />
            </div>
          </div> */}
          <DynamicInput
            inputs={stop_point_details}
            handleSelectChange={handleSelectChange}
            handleChange={handleChange}
          />
          <Separator className="my-4" />
          <DynamicInput
            inputs={contact_details}
            handleSelectChange={handleSelectChange}
            handleChange={handleChange}
          />
          <Separator className="my-4" />
          <DynamicInput
            inputs={address_details}
            handleSelectChange={handleSelectChange}
            handleChange={handleChange}
          />
          <Separator className="my-4" />
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Additional information about this stop point"
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label>Facilities</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Facilities functionality will be implemented in a future update
            </p>
            {/* Facilities would be implemented here, perhaps as a multi-select or checkboxes */}
          </div>
        </DetailCard>

        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            // className="bg-[#d3d3d3] text-[#333] hover:bg-[#c0c0c0] dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Stop Point
          </Button>
        </div>
      </div>
    </form>
  )
}

export default StopPointForm

'use client'

// react
import { useEffect, useState } from 'react'

// components
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import DetailCard from '../ui/detail-card'
import DynamicInput from '../ui/dynamic-input'

// icons
import { Save } from 'lucide-react'

// context
import { upsertCostCentre } from '@/context/cost-centres-context/api'
import { useGlobalContext } from '@/context/global-context/context'
import { getLatLngFromAddress } from '@/hooks/get-coords'
import AddressAutocomplete from '../ui/address-autocomplete'
import { createClient } from '@/lib/supabase/client'

// hooks

const CostCentreForm = ({ id, onCancel }) => {
  const { cost_centres, costCentresDispatch, setModalOpen } = useGlobalContext()
  const costCentre = cost_centres?.data.find((cc) => cc?.id === id)

  const supabase = createClient();

  const [formData, setFormData] = useState({
    id: costCentre?.id || '',
    name: costCentre?.name || '',
    street: costCentre?.street || '',
    city: costCentre?.city || '',
    state: costCentre?.state || '',
    country: costCentre?.country || '',
    coords: costCentre?.coords || '',
    manager: costCentre?.manager || '',
    manager_email: costCentre?.manager_email || '',
    manager_phone: costCentre?.manager_phone || '',
    status: costCentre?.status || 'active',
    established: costCentre?.established || '',
    budget: costCentre?.budget || '',
    description: costCentre?.description || '',
    fullAddress: `${costCentre?.street || ''}, ${costCentre?.city || ''}, ${costCentre?.state || ''
      }, ${costCentre?.country || ''}`,
  })

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

  const handleAddressSelect = (components) => {
    setFormData((prev) => ({
      ...prev,
      street: components.street || prev.street,
      city: components.city || prev.city,
      state: components.state || prev.state,
      country: components.country || prev.country,
      fullAddress: components.formatted_address || prev.fullAddress,
    }))
  }

  const handleCoordinatesChange = (coords) => {
    setFormData((prev) => ({
      ...prev,
      coords,
    }))
  }

  const onSubmit = async (data) => {
    // Use the context API so reducers/UI update immediately
    try {
      const payload = {
        id: data.id || undefined,
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        coords: data.coords,
        manager: data.manager,
        manager_email: data.manager_email,
        manager_phone: data.manager_phone,
        status: data.status,
        established: data.established,
        budget: data.budget,
        description: data.description,
      }

      // call the context API which will dispatch the appropriate actions
      console.debug('upsertCostCentre payload:', payload)
      await upsertCostCentre(data.id || null, payload, costCentresDispatch)

      // log current context list to help debug DataTable updates
      try {
        console.debug('cost_centres after upsert:', cost_centres?.data)
      } catch (e) {
        console.error('Error reading cost_centres after upsert', e)
      }

      // close modal / form
      if (typeof setModalOpen === 'function') setModalOpen(false)
      if (typeof onCancel === 'function') onCancel()
    } catch (err) {
      console.error('Error saving cost centre via context API', err)
      alert('There was an error saving the cost centre. Please try again.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const cost_centre_details = [
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
      placeholder: 'e.g., Main Distribution Centre',
      required: true,
    },
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
      readOnly: true,
    },
    {
      htmlFor: 'longitude',
      label: 'Longitude',
      value: formData.coords?.lng || '',
      placeholder: 'e.g., 28.0473',
      readOnly: true,
    },
    {
      htmlFor: 'manager',
      label: 'Manager *',
      value: formData.manager,
      placeholder: 'e.g., John Smith',
      required: true,
    },
    {
      htmlFor: 'manager_email',
      label: 'Manager Email',
      value: formData.manager_email,
      placeholder: 'manager@company.com',
      required: true,
    },
    {
      htmlFor: 'manager_phone',
      label: 'Manager Phone',
      value: formData.manager_phone,
      placeholder: '+27 11 123 4567',
      required: true,
    },
    {
      type: 'select',
      htmlFor: 'status',
      label: 'Status',
      value: formData.status,
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
    {
      type: 'date',
      htmlFor: 'established',
      label: 'Established',
      value: formData.established,
      placeholder: 'Select establishment date',
    },
    {
      htmlFor: 'budget',
      label: 'Budget',
      value: formData.budget,
      placeholder: 'e.g., R 500,000',
    },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {costCentre?.id ? 'Edit Cost Centre' : 'Add New Cost Centre'}
            </h2>
            <p className="text-muted-foreground">
              {costCentre?.id ? costCentre.name : 'Enter Cost Centre Details'}
            </p>
          </div>
        </div>

        <DetailCard
          title="Cost Centre Information"
          description="Enter the details for this cost centre"
        >
          {/* Address Autocomplete */}
          <div className="mb-4">
            <AddressAutocomplete
              label="Search Address"
              value={formData.fullAddress}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, fullAddress: val }))
              }
              onAddressSelect={handleAddressSelect}
              onCoordinatesChange={handleCoordinatesChange}
              placeholder="Start typing an address..."
            />
          </div>

          <DynamicInput
            inputs={cost_centre_details}
            handleSelectChange={handleSelectChange}
            handleChange={handleChange}
          />

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a description of this cost centre"
              rows={4}
            />
          </div>
        </DetailCard>

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Cost Centre
          </Button>
        </div>
      </div>
    </form>
  )
}

export default CostCentreForm

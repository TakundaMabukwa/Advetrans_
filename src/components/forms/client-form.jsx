'use client'

// react
import { useEffect, useState } from 'react'

// icons
import { ArrowLeft, Save, Plus, Trash2, MapPin } from 'lucide-react'

// components
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGlobalContext } from '@/context/global-context/context'
import { Separator } from '@/components/ui/separator'
import DetailCard from '../ui/detail-card'
import DynamicInput from '../ui/dynamic-input'
import { getLatLngFromAddress } from '@/hooks/get-coords'
import { createClient } from '@/lib/supabase/client'
import AddressAutocomplete from '../ui/address-autocomplete'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'


export function ClientForm({ id, onCancel }) {
  const { clients, clientsDispatch, } =
    useGlobalContext()
  const { modelOpen, setModalOpen } = useState(false);
  const client = clients?.data.find((c) => c.id === id)
  const [currentTab, setCurrentTab] = useState(0)
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contactPerson: client?.contactPerson || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    street: client?.street || '',
    city: client?.city || '',
    state: client?.state || '',
    country: client?.country || '',
    coords: client?.coords || '',
    industry: client?.industry || '',
    ckNumber: client?.ckNumber || '',
    taxNumber: client?.vatNumber || '',
    vatNumber: client?.vatNumber || '',
    status: client?.status || 'Active',
    pickupLocations: client?.pickupLocations || [],
    dropoffLocations: client?.dropoffLocations || [],
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

  const tabs = [
    { name: 'Client Information', value: 'basic_info' },
    { name: 'Client Locations', value: 'locations' },
  ]

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
    // upsertClient(id, data, clientsDispatch)
    const { data: clientData, error } = await supabase.from('clients').upsert([
      {
        name: data.name,
        contact_person: data.contactPerson,
        email: data.email,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        coords: data.coords,
        address: `${data.street}, ${data.city}, ${data.state}, ${data.country}`,
        industry: data.industry,
        ck_number: data.ckNumber,
        tax_number: data.taxNumber,
        vat_number: data.vatNumber,
        status: data.status,
        pickup_locations: data.pickupLocations,
        dropoff_locations: data.dropoffLocations,
      },
    ])

    if (!error || clientData) {
      console.log('Client upserted:', clientData[0])
      setModalOpen(false);
    } else {
      console.error('Error upserting client:', error)
      alert('There was an error saving the client. Please try again.')
    }


  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

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

  // Location management functions
  const addPickupLocation = () => {
    setFormData((prev) => ({
      ...prev,
      pickupLocations: [
        ...prev.pickupLocations,
        {
          id: Date.now().toString(),
          name: '',
          address: '',
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          operatingHours: '',
          notes: '',
        },
      ],
    }))
  }

  const removePickupLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      pickupLocations: prev.pickupLocations.filter((_, i) => i !== index),
    }))
  }

  const updatePickupLocation = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      pickupLocations: prev.pickupLocations.map((location, i) =>
        i === index ? { ...location, [field]: value } : location
      ),
    }))
  }

  const addDropoffLocation = () => {
    setFormData((prev) => ({
      ...prev,
      dropoffLocations: [
        ...prev.dropoffLocations,
        {
          id: Date.now().toString(),
          name: '',
          address: '',
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          operatingHours: '',
          notes: '',
        },
      ],
    }))
  }

  const removeDropoffLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      dropoffLocations: prev.dropoffLocations.filter((_, i) => i !== index),
    }))
  }

  const updateDropoffLocation = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      dropoffLocations: prev.dropoffLocations.map((location, i) =>
        i === index ? { ...location, [field]: value } : location
      ),
    }))
  }

  const client_information = [
    {
      htmlFor: 'id',
      label: 'ID',
      value: formData.id,
      required: false,
      readOnly: true,
    },
    {
      htmlFor: 'name',
      label: 'Company Name *',
      value: formData.name,
      placeholder: 'ABC Manufacturing',
      required: true,
    },
    // {
    //   htmlFor: 'industry',
    //   label: 'Industry',
    //   value: formData.industry,
    //   placeholder: 'e.g., Manufacturing',
    //   required: false,
    // },
    {
      htmlFor: 'ckNumber',
      label: 'Registration Number',
      value: formData.ckNumber,
      placeholder: '2025/40476/1234',
      required: false,
    },
    {
      htmlFor: 'taxNumber',
      label: 'Tax Number',
      value: formData.taxNumber,
      placeholder: 'ABN 12 345 678 901',
      required: false,
    },
    {
      htmlFor: 'vatNumber',
      label: 'Vat Number',
      value: formData.vatNumber,
      placeholder: '456787654',
      required: false,
    },
    {
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ],
      htmlFor: 'status',
      label: 'Status',
      value: formData.status,
      placeholder: 'Active',
      required: false,
    },
  ]

  const contact_details = [
    {
      htmlFor: 'contactPerson',
      label: 'Contact Person *',
      value: formData.contactPerson,
      placeholder: 'John Smith',
      required: true,
    },
    {
      htmlFor: 'email',
      label: 'Email *',
      value: formData.email,
      placeholder: 'contact@company.com',
      required: true,
    },
    {
      htmlFor: 'phone',
      label: 'Phone *',
      value: formData.phone,
      placeholder: '+61 2 9876 5432',
      required: true,
    },
  ]
  const client_address = [
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 grid-cols-1">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {client?.id ? `Edit Client` : 'Add New Client'}
            </h2>
            <p className="text-muted-foreground">
              {client?.id ? client.name : 'Enter Client Details'}
            </p>
          </div>
        </div>

        <Tabs
          value={tabs[currentTab]?.value}
          onValueChange={(value) => {
            const index = tabs.findIndex((tab) => tab.value === value)
            setCurrentTab(index)
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-6">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab.value}
                onClick={() => setCurrentTab(index)}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic_info" className="space-y-4">
            <DetailCard
              title="Client Information"
              description="Enter the details for this client"
            >
              <DynamicInput
                inputs={client_information}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />

              <Separator className="my-4" />

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
                inputs={client_address}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
              <Separator className="my-4" />
              <DynamicInput
                inputs={contact_details}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
            </DetailCard>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            {/* Pickup Locations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pickup Locations</CardTitle>
                    <CardDescription>
                      Add locations where goods will be picked up from
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPickupLocation}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.pickupLocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No pickup locations added yet.</p>
                    <p className="text-sm">
                      Add locations where goods will be collected from.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.pickupLocations.map((location, index) => (
                      <div key={location.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="px-2 py-1">
                            Pickup Location {index + 1}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePickupLocation(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Location Name *</Label>
                            <Input
                              value={location.name}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'name',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Main Warehouse"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <Input
                              value={location.contactPerson}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'contactPerson',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., John Smith"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Phone</Label>
                            <Input
                              value={location.contactPhone}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'contactPhone',
                                  e.target.value
                                )
                              }
                              placeholder="+27 82 123 4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input
                              type="email"
                              value={location.contactEmail}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'contactEmail',
                                  e.target.value
                                )
                              }
                              placeholder="contact@warehouse.com"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Address *</Label>
                            <Textarea
                              value={location.address}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'address',
                                  e.target.value
                                )
                              }
                              placeholder="123 Industrial Park, Johannesburg"
                              rows={2}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Operating Hours</Label>
                            <Input
                              value={location.operatingHours}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'operatingHours',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Mon-Fri: 8AM-5PM"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                              value={location.notes}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  'notes',
                                  e.target.value
                                )
                              }
                              placeholder="Additional information"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dropoff Locations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dropoff Locations</CardTitle>
                    <CardDescription>
                      Add locations where goods will be delivered to
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDropoffLocation}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.dropoffLocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No dropoff locations added yet.</p>
                    <p className="text-sm">
                      Add locations where goods will be delivered to.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.dropoffLocations.map((location, index) => (
                      <div key={location.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="px-2 py-1">
                            Dropoff Location {index + 1}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDropoffLocation(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Location Name *</Label>
                            <Input
                              value={location.name}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'name',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Distribution Centre"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <Input
                              value={location.contactPerson}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'contactPerson',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Jane Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Phone</Label>
                            <Input
                              value={location.contactPhone}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'contactPhone',
                                  e.target.value
                                )
                              }
                              placeholder="+27 82 987 6543"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input
                              type="email"
                              value={location.contactEmail}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'contactEmail',
                                  e.target.value
                                )
                              }
                              placeholder="contact@distribution.com"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Address *</Label>
                            <Textarea
                              value={location.address}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'address',
                                  e.target.value
                                )
                              }
                              placeholder="456 Business Park, Cape Town"
                              rows={2}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Operating Hours</Label>
                            <Input
                              value={location.operatingHours}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'operatingHours',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Mon-Fri: 7AM-6PM"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                              value={location.notes}
                              onChange={(e) =>
                                updateDropoffLocation(
                                  index,
                                  'notes',
                                  e.target.value
                                )
                              }
                              placeholder="Additional information"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Client
          </Button>
        </div>
      </div>
    </form>
  )
}


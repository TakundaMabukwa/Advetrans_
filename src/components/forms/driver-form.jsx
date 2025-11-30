// export default DriverForm

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ChevronLeft, ChevronRight, Save } from 'lucide-react'

import * as api from '@/context/drivers-context/api'
import { useGlobalContext } from '@/context/global-context/context'
import DetailCard from '@/components/ui/detail-card'
import DynamicInput from '@/components/ui/dynamic-input'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CardDescription, CardTitle } from '@/components/ui/card'

const DriverForm = ({ id, onCancel }) => {
  const { drivers, cost_centres, driversDispatch } = useGlobalContext()
  const driver = drivers?.data?.find((cc) => cc.id === id)
  const costCentres = cost_centres?.data
  // const vehicles = useGlobalContext().vehicles.data

  const [formData, setFormData] = useState({
    id: driver?.id || '',
    costCentre: driver?.costCentre || '',
    name: driver?.name || '',
    lastName: driver?.lastName || '',
    idDoctype: driver?.idDoctype || 'ID',
    identityNumber: driver?.identityNumber || '',
    phone: driver?.phone || '',
    email: driver?.email || '',
    emergencyContact: driver?.emergencyContact || '',
    emergencyPhone: driver?.emergencyPhone || '',

    licenseType: driver?.licenseType || 'SA',
    license: driver?.license || '',
    licenseCode: driver?.licenseCode || '',
    licenseExpiry: driver?.licenseExpiry || '',
    attach_license_front: driver?.attach_license_front || '',
    attach_license_back: driver?.attach_license_back || '',
    professionalPermit: driver?.professionalPermit || false,
    attach_professional_Permit: driver?.attach_professional_Permit || '',
    permitExpiryDate: driver?.permitExpiryDate || '',

    status: driver?.status || 'available',
    currentVehicle: driver?.currentVehicle || '',
    assignedTo: driver?.assignedTo || '',
    currentTripId: driver?.currentTripId || null,
    currentTrip: driver?.currentTrip || null,
    lastTripId: driver?.lastTripId || null,

    dateOfBirth: driver?.dateOfBirth || '',
    medicalExamExpiry: driver?.medicalExamExpiry || '',
    hireDate: driver?.hireDate || '',

    certifications: driver?.certifications?.join(', ') || '',
    drivingRecord: driver?.drivingRecord || {
      violations: 0,
      accidents: 0,
      lastReviewDate: '',
    },
    recentTrips: driver?.recentTrips || [],
  })
  //console.log('driver', driver?.status)
  const [currentTab, setCurrentTab] = useState(0)

  const tabs = [
    { name: 'Driver Information', value: 'driver_info' },
    { name: 'License Information', value: 'license_info' },
    { name: 'Currents Status', value: 'status' },
  ]

  const nextStep = () => {
    if (currentTab < 2) {
      const next = currentTab + 1
      setCurrentTab(next)
    }
  }

  const prevStep = () => {
    if (currentTab > 0) {
      const prev = currentTab - 1
      setCurrentTab(prev)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('drivingRecord.')) {
      const key = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        drivingRecord: {
          ...prev.drivingRecord,
          [key]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSubmit = {
      ...formData,
      certifications: formData.certifications
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== ''),
    }

    api.upsertDriver(id, dataToSubmit, driversDispatch)

    onCancel()
  }

  const driver_details = [
    {
      htmlFor: 'id',
      label: 'ID',
      value: formData.id,
      required: false,
      readOnly: true,
    },
    {
      type: 'select',
      htmlFor: 'costCentre',
      label: 'Cost Centre *',
      placeholder: 'Select cost centre',
      value: formData.costCentre,
      required: true,
      options: costCentres?.map((cc) => {
        return { value: cc.name, label: cc.name }
      }),
    },
    {
      htmlFor: 'name',
      label: 'Name *',
      value: formData.name,
      placeholder: 'e.g., John',
      required: true,
    },
    {
      htmlFor: 'lastName',
      label: 'Last Name *',
      value: formData.lastName,
      placeholder: 'e.g., Smith',
      required: true,
    },
    {
      type: 'select',
      htmlFor: 'idDoctype',
      label: 'ID Type *',
      placeholder: 'Select ID type',
      value: formData.idDoctype,
      required: true,
      readOnly: false,
      options: [
        { value: 'ID', label: 'South African ID' },
        { value: 'Passport', label: 'International Passport' },
      ],
    },
    {
      htmlFor: 'identityNumber',
      label:
        formData.idDoctype === 'ID'
          ? 'Identification Number *'
          : 'Passport Number *',
      value: formData.identityNumber,
      placeholder:
        formData.idDoctype === 'ID' ? 'e.g., 8501015009087' : 'e.g., A12345678',
      required: true,
    },
    {
      htmlFor: 'phone',
      label: 'Contact Number *',
      value: formData.phone,
      placeholder: '+27 82 123 4567',
      required: true,
    },
    {
      htmlFor: 'email',
      label: 'Email Address *',
      value: formData.email,
      placeholder: 'john.smith@email.com',
      required: true,
    },
    {
      htmlFor: 'emergencyContact',
      label: 'Emergency Contact *',
      value: formData.emergencyContact,
      placeholder: 'e.g., Jane Smith',
      required: true,
    },
    {
      htmlFor: 'emergencyPhone',
      label: 'Emergency Contact Number *',
      value: formData.emergencyPhone,
      placeholder: '+27 82 987 6543',
      required: true,
    },
  ]

  const license_details = [
    {
      type: 'select',
      htmlFor: 'licenseType',
      label: 'Country of Issue *',
      placeholder: 'Select local/international',
      value: formData.licenseType,
      required: true,
      readOnly: false,
      options: [
        { value: 'SA', label: 'South African' },
        { value: 'International', label: 'International' },
      ],
    },
    {
      htmlFor: 'license',
      label: 'Drivers License Number *',
      value: formData.license,
      placeholder: 'e.g., 1234567890123',
      required: true,
    },
    {
      htmlFor: 'licenseCode',
      label: 'License Code *',
      value: formData.licenseCode,
      placeholder: 'e.g., C1',
      required: true,
    },
    {
      htmlFor: 'licenseExpiry',
      label: 'License Expiry Date *',
      type: 'date',
      value: formData.licenseExpiry,
      placeholder: 'Select expiry date',
      required: true,
    },
    {
      htmlFor: 'driverRestrictionCode',
      label: 'Driver Restrictions *',
      value: formData.driverRestrictionCode,
      placeholder: 'e.g., A - Corrective lenses',
      required: true,
    },
    {
      htmlFor: 'vehicleRestrictionCode',
      label: 'Vehicle restrictions *',
      value: formData.vehicleRestrictionCode,
      placeholder: 'e.g., Automatic transmission only',
      required: true,
    },
  ]

  const documents = [
    {
      htmlFor: 'attach_license_front',
      label: 'Drivers License (Front)',
      type: 'file',
      value: formData.attach_license_front,
      required: true,
    },
    {
      htmlFor: 'attach_license_back',
      label: 'Drivers License (Back)',
      type: 'file',
      value: formData.attach_license_back,
      required: true,
    },
    {
      type: 'select',
      htmlFor: 'professionalPermit',
      label: 'Special Permits',
      placeholder: 'Indicate if any special permits',
      value: formData.professionalPermit,
      required: true,
      readOnly: false,
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      htmlFor: 'permitExpiryDate',
      label: 'Permit Expiry Date',
      type: 'date',
      value: formData.permitExpiryDate,
      required: true,
      readOnly: formData.professionalPermit === false,
    },
  ]

  const current_status = [
    {
      htmlFor: 'currentVehicle',
      label: 'Current Vehicle',
      value: formData.currentVehicle,
      readOnly: true,
    },
    {
      htmlFor: 'assignedTo',
      label: 'Current Client',
      value: formData.assignedTo,
      readOnly: true,
    },
    {
      htmlFor: 'currentTripId',
      label: 'Current Trip ID',
      value: formData.currentTripId || 'None',
      readOnly: true,
    },
    {
      htmlFor: 'lastTripId',
      label: 'Last Trip ID',
      value: formData.lastTripId || 'None',
      readOnly: true,
    },
    {
      htmlFor: 'status',
      label: 'Current Status',
      placeholder: 'Select current status',
      value: formData.status,
      type: 'select',
      required: false,
      options: [
        { value: 'available', label: 'Available' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'on-trip', label: 'On Trip' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 ">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {driver?.id ? `Edit Driver` : 'Add New Driver'}
            </h2>
            <p className="text-muted-foreground">
              {driver?.id ? driver.name : 'Enter Driver Details'}
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
          <TabsList className="grid w-full grid-cols-3 gap-6">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                tabIndex={currentTab}
                value={tab.value}
                onClick={() => {
                  setCurrentTab(index)
                }}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="driver_info" className="space-y-4">
            <DetailCard
              title={'Driver Information'}
              description={'Enter the details for this driver'}
            >
              <DynamicInput
                inputs={driver_details}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />

              <div className="space-y-2 mt-4 sm:col-span-2 ">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street, Johannesburg, 2000"
                />
              </div>
            </DetailCard>
          </TabsContent>

          <TabsContent value="license_info" className="space-y-4">
            <DetailCard
              title={'Driver License Information'}
              description={'Enter Driver License information'}
            >
              <DynamicInput
                inputs={license_details}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
              <Separator className="my-4 space-y-1" />

              <div className="mb-6">
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Upload Driver documents</CardDescription>
              </div>
              <DynamicInput
                inputs={documents}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
            </DetailCard>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <DetailCard
              title={'Driver Current Status'}
              description={'Enter or update driver status'}
            >
              <DynamicInput
                inputs={current_status}
                handleSelectChange={handleSelectChange}
                handleChange={handleChange}
              />
            </DetailCard>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 ">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={'min-w-[120px]'}
          >
            Cancel
          </Button>
          <div className="items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              className={currentTab == 0 ? 'shadow-none' : 'shadow'}
              disabled={currentTab == 0}
              onClick={prevStep}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              type="button"
              className={currentTab == 2 ? 'shadow-none' : 'shadow'}
              disabled={currentTab == 2}
              onClick={nextStep}
            >
              <ChevronRight />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={currentTab !== 2}
            className={'min-w-[120px]'}
          >
            <Save className="mr-2 h-4 w-4" /> Save Driver
          </Button>
        </div>
      </div>
    </form>
  )
}

export default DriverForm

/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Input
                    id="license"
                    name="license"
                    value={formData.license}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry</Label>
                  <Input
                    id="licenseExpiry"
                    name="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-trip">On A Trip</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="onLeave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costCentre">Cost Centre</Label>
                  <Select
                    value={formData.costCentre}
                    onValueChange={(value) =>
                      handleSelectChange('costCentre', value)
                    }
                  >
                    <SelectTrigger id="costCentre">
                      <SelectValue placeholder="Select cost centre" />
                    </SelectTrigger>
                    <SelectContent>
                      {costCentres.map((centre) => (
                        <SelectItem key={centre.id} value={centre.name}>
                          {centre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentVehicle">Current Vehicle</Label>
                  <Select
                    value={formData.currentVehicle}
                    onValueChange={(value) =>
                      handleSelectChange('currentVehicle', value)
                    }
                  >
                    <SelectTrigger id="currentVehicle">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.type} {v.regNumber || v.licensePlate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalExamExpiry">Medical Exam Expiry</Label>
                  <Input
                    id="medicalExamExpiry"
                    name="medicalExamExpiry"
                    type="date"
                    value={formData.medicalExamExpiry}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="certifications">
                    Certifications (comma-separated)
                  </Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivingRecord.violations">Violations</Label>
                  <Input
                    id="drivingRecord.violations"
                    name="drivingRecord.violations"
                    type="number"
                    value={formData.drivingRecord.violations}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivingRecord.accidents">Accidents</Label>
                  <Input
                    id="drivingRecord.accidents"
                    name="drivingRecord.accidents"
                    type="number"
                    value={formData.drivingRecord.accidents}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivingRecord.lastReviewDate">
                    Last Review Date
                  </Label>
                  <Input
                    id="drivingRecord.lastReviewDate"
                    name="drivingRecord.lastReviewDate"
                    type="date"
                    value={formData.drivingRecord.lastReviewDate}
                    onChange={handleChange}
                  />
                </div>
              </div> */

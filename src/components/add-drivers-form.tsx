'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  User, 
  IdCard, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload, 
  Save, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { addDriver } from "@/lib/action/drivers"

interface DriverFormData {
  // Basic Information
  surname: string
  identification_number: string
  email_address: string
  cell_number: string
  
  // Account & Codes
  new_account_number: string
  code: string
  managed_code: string
  
  // Address & Contact
  address: string
  cellular: string
  
  // License Information
  license_number: string
  license_expiry_date: string
  license_code: string
  driver_restriction_code: string
  vehicle_restriction_code: string
  
  // Documents & Permits
  sa_issued: boolean
  professional_driving_permit: boolean
  pdp_expiry_date: string
  
  // Additional Information
  additional_info: string
  
  // Status
  driver_status: string
  eps_validation: boolean
}

const initialFormData: DriverFormData = {
  surname: '',
  identification_number: '',
  email_address: '',
  cell_number: '',
  new_account_number: '',
  code: '',
  managed_code: '',
  address: '',
  cellular: '',
  license_number: '',
  license_expiry_date: '',
  license_code: '',
  driver_restriction_code: '',
  vehicle_restriction_code: '',
  sa_issued: false,
  professional_driving_permit: false,
  pdp_expiry_date: '',
  additional_info: '',
  driver_status: 'Active',
  eps_validation: false
}

export function AddDriversForm() {
  const [formData, setFormData] = useState<DriverFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<DriverFormData>>({})

  const handleInputChange = (field: keyof DriverFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<DriverFormData> = {}
    
    // Required fields validation
    if (!formData.surname.trim()) {
      newErrors.surname = 'Full name is required'
    }
    
    // Email validation
    if (formData.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = 'Please enter a valid email address'
    }
    
    // Phone validation
    if (formData.cell_number && !/^[\d\s\-\+\(\)]+$/.test(formData.cell_number)) {
      newErrors.cell_number = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await addDriver(formData)
      
      if (result.success) {
        toast.success(result.message)
        setFormData(initialFormData)
        setErrors({})
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setErrors({})
    toast.info('Form reset')
  }

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg rounded-xl w-12 h-12">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-2xl">Add New Driver</h2>
              <p className="text-gray-600 text-sm mt-1">Complete the form below to add a new driver to the system</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 max-h-[70vh] overflow-y-auto">
        {/* Basic Information Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-10 h-10 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Basic Information</h3>
          </div>
          
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="surname" className="font-medium text-gray-700 text-sm">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.surname ? 'border-red-500' : ''}`}
                placeholder="Enter full name"
              />
              {errors.surname && (
                <p className="flex items-center space-x-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.surname}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="identification_number" className="font-medium text-gray-700 text-sm">
                Identification Number
              </Label>
              <Input
                id="identification_number"
                value={formData.identification_number}
                onChange={(e) => handleInputChange('identification_number', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter ID/Passport number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email_address" className="font-medium text-gray-700 text-sm">
                Email Address
              </Label>
              <Input
                id="email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => handleInputChange('email_address', e.target.value)}
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.email_address ? 'border-red-500' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email_address && (
                <p className="flex items-center space-x-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email_address}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cell_number" className="font-medium text-gray-700 text-sm">
                Cell Phone Number
              </Label>
              <Input
                id="cell_number"
                value={formData.cell_number}
                onChange={(e) => handleInputChange('cell_number', e.target.value)}
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.cell_number ? 'border-red-500' : ''}`}
                placeholder="Enter cell phone number"
              />
              {errors.cell_number && (
                <p className="flex items-center space-x-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.cell_number}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cellular" className="font-medium text-gray-700 text-sm">
                Alternative Cellular
              </Label>
              <Input
                id="cellular"
                value={formData.cellular}
                onChange={(e) => handleInputChange('cellular', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter alternative phone number"
              />
            </div>
          </div>
        </div>

        {/* Account & Codes Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex justify-center items-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg w-10 h-10 shadow-md">
              <IdCard className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Account & Codes</h3>
          </div>
          
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="new_account_number" className="font-medium text-gray-700 text-sm">
                Account Number
              </Label>
              <Input
                id="new_account_number"
                value={formData.new_account_number}
                onChange={(e) => handleInputChange('new_account_number', e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter account number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="font-medium text-gray-700 text-sm">
                Driver Code
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter driver code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="managed_code" className="font-medium text-gray-700 text-sm">
                Managed Code
              </Label>
              <Input
                id="managed_code"
                value={formData.managed_code}
                onChange={(e) => handleInputChange('managed_code', e.target.value)}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter managed code"
              />
            </div>
          </div>
        </Card>

        {/* Address & Location Section */}
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex justify-center items-center bg-purple-100 rounded-full w-8 h-8">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Address & Location</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="font-medium text-gray-700 text-sm">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                placeholder="Enter full address"
              />
            </div>
          </div>
        </Card>

        {/* License Information Section */}
        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex justify-center items-center bg-orange-100 rounded-full w-8 h-8">
              <IdCard className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">License Information</h3>
          </div>
          
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="license_number" className="font-medium text-gray-700 text-sm">
                License Number
              </Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter license number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license_expiry_date" className="font-medium text-gray-700 text-sm">
                License Expiry Date
              </Label>
              <Input
                id="license_expiry_date"
                type="date"
                value={formData.license_expiry_date}
                onChange={(e) => handleInputChange('license_expiry_date', e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license_code" className="font-medium text-gray-700 text-sm">
                License Code
              </Label>
              <Input
                id="license_code"
                value={formData.license_code}
                onChange={(e) => handleInputChange('license_code', e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter license code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driver_restriction_code" className="font-medium text-gray-700 text-sm">
                Driver Restriction Code
              </Label>
              <Input
                id="driver_restriction_code"
                value={formData.driver_restriction_code}
                onChange={(e) => handleInputChange('driver_restriction_code', e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter restriction code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle_restriction_code" className="font-medium text-gray-700 text-sm">
                Vehicle Restriction Code
              </Label>
              <Input
                id="vehicle_restriction_code"
                value={formData.vehicle_restriction_code}
                onChange={(e) => handleInputChange('vehicle_restriction_code', e.target.value)}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter vehicle restriction code"
              />
            </div>
          </div>
        </Card>

        {/* Permits & Documents Section */}
        <Card className="p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex justify-center items-center bg-indigo-100 rounded-full w-8 h-8">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Permits & Documents</h3>
          </div>
          
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sa_issued"
                  checked={formData.sa_issued}
                  onCheckedChange={(checked) => handleInputChange('sa_issued', checked as boolean)}
                />
                <Label htmlFor="sa_issued" className="font-medium text-gray-700 text-sm">
                  SA Issued
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="professional_driving_permit"
                  checked={formData.professional_driving_permit}
                  onCheckedChange={(checked) => handleInputChange('professional_driving_permit', checked as boolean)}
                />
                <Label htmlFor="professional_driving_permit" className="font-medium text-gray-700 text-sm">
                  Professional Driving Permit
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="eps_validation"
                  checked={formData.eps_validation}
                  onCheckedChange={(checked) => handleInputChange('eps_validation', checked as boolean)}
                />
                <Label htmlFor="eps_validation" className="font-medium text-gray-700 text-sm">
                  EPS Validation
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pdp_expiry_date" className="font-medium text-gray-700 text-sm">
                PDP Expiry Date
              </Label>
              <Input
                id="pdp_expiry_date"
                type="date"
                value={formData.pdp_expiry_date}
                onChange={(e) => handleInputChange('pdp_expiry_date', e.target.value)}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Additional Information Section */}
        <Card className="p-6 border-l-4 border-l-gray-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex justify-center items-center bg-gray-100 rounded-full w-8 h-8">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Additional Information</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="additional_info" className="font-medium text-gray-700 text-sm">
                Additional Information
              </Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => handleInputChange('additional_info', e.target.value)}
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 min-h-[120px]"
                placeholder="Enter any additional information about the driver"
              />
            </div>
          </div>
        </Card>

      </form>
      
      {/* Submit Section - Fixed at bottom */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 border-t border-gray-100 sticky bottom-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg w-10 h-10 shadow-md">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Ready to Submit</h3>
              <p className="text-gray-600 text-sm">Review the information and submit to add the driver</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              <span>Reset Form</span>
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 hover:from-blue-600 to-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl text-white transition-all duration-200 px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                  <span>Adding Driver...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Add Driver</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

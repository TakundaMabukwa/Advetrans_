"use client"

import React, { useEffect, useState } from "react";
import { Button } from '@/components/ui/button'
import { SecureButton } from '@/components/SecureButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, Activity, BarChart3, Settings, Star, AlertTriangle, Edit, Trash } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import DriverDashboardClean from '@/components/driver-dashboard-clean'
import { DashboardProvider } from '@/context/dashboard-context'
import DriverPerformanceDashboard from '@/components/dashboard/DriverPerformanceDashboard'
import ExecutiveDashboardEPS from '@/components/dashboard/ExecutiveDashboardEPS'
import { MaterialCharts } from '@/components/material-charts'
import { epsApi, BiWeeklyCategory, DailyStats } from '@/lib/eps-api'

import ViolationsChart from '@/components/charts/ViolationsChart'
import SpeedingViolationsChart from '@/components/charts/SpeedingViolationsChart'

// NOTE: This file is self-contained for convenience. It uploads files to
// the Supabase storage *bucket* named `files` and places them under:
// - images/drivers/  (for front/rear license images)
// - files/driver/    (for work permit docs)
// Make sure your Supabase project has a bucket called `files` and the
// appropriate RLS/policies or public access for getPublicUrl to work.

type Driver = {
    id?: number
    first_name: string
    surname: string
    id_or_passport_number: string
    id_or_passport_document?: string | null
    passport_date?: string | null
    passport_expiry?: string | null
    passport_status?: string | null
    email_address?: string | null
    cell_number?: string | null
    apointment_date?: string | null
    sa_issued?: boolean
    work_permit_upload?: string | null
    license_number?: string | null
    license_expiry_date?: string | null
    license_code?: string | null
    driver_restriction_code?: string | null
    vehicle_restriction_code?: string | null
    front_of_driver_pic?: string | null
    rear_of_driver_pic?: string | null
    professional_driving_permit?: boolean
    pdp_expiry_date?: string | null
    hazCamDate?: string | null
    medic_exam_date?: string | null
    pop?: string | null
    salary?: number | null
    hourly_rate?: number | null
    created_at?: string | null
    created_by?: string | null
    user_id?: string | null
}

export default function Drivers() {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<string>('drivers-management')

    const [drivers, setDrivers] = useState<Driver[]>([])
    
    type Equipment = {
        id: number
        plate: string
        unitIpAddress: string
        tankSize: number | string
        costCentre: string
    }
    const [equipment, setEquipment] = useState<Equipment[]>([
        { id: 1, plate: 'HW67VCGP M', unitIpAddress: '57.163.1.216', tankSize: 1100, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
        { id: 2, plate: 'JR30TPGP', unitIpAddress: '57.163.1.253', tankSize: 840, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
        { id: 3, plate: 'HY87GKGP', unitIpAddress: '59.98.1.136', tankSize: 1100, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
        { id: 4, plate: 'HW67VGG P M', unitIpAddress: '57.164.1.188', tankSize: 1100, costCentre: 'EPS => Open network - (COST CODE: 001)' },
        { id: 5, plate: 'HS30XYGP', unitIpAddress: '58.207.1.148', tankSize: 840, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
    ])
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadingField, setUploadingField] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [licenseFilter, setLicenseFilter] = useState<'all' | 'sa' | 'foreign'>('all')
    const [isEditing, setIsEditing] = useState(false)
    const [editingDriverId, setEditingDriverId] = useState<number | null>(null)

    // Chart data for Executive Dashboard
    const [biWeeklyData, setBiWeeklyData] = useState<BiWeeklyCategory[]>([])
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([])


    const emptyForm: Driver = {
        first_name: '',
        surname: '',
        id_or_passport_number: '',
        id_or_passport_document: null,
        email_address: null,
        cell_number: null,
        sa_issued: false,
        work_permit_upload: null,
        license_number: null,
        license_expiry_date: null,
        license_code: null,
        driver_restriction_code: null,
        vehicle_restriction_code: null,
        front_of_driver_pic: null,
        rear_of_driver_pic: null,
        professional_driving_permit: false,
        pdp_expiry_date: null,
        salary: null,
        hourly_rate: null,
        created_by: null,
    }

    const [formData, setFormData] = useState<Driver>(emptyForm)

    useEffect(() => {
        fetchDrivers()
    }, [activeTab])

    useEffect(() => {
        // Fetch EPS charts data for executive dashboard
        let mounted = true
        const fetchCharts = async () => {
            try {
                const b = await epsApi.getBiWeeklyCategories()
                const d = await epsApi.getDailyStats()
                if (!mounted) return
                setBiWeeklyData(Array.isArray(b) ? b as BiWeeklyCategory[] : [])
                setDailyStats(Array.isArray(d) ? d as DailyStats[] : [])
            } catch (err) {
                console.error('Failed to fetch executive dashboard charts data', err)
            }
        }

        fetchCharts()
        return () => { mounted = false }
    }, [])



    const fetchDrivers = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDrivers((data ?? []) as Driver[])
        } catch (err) {
            console.error('fetchDrivers error', err)
            toast.error('Failed to fetch drivers')
            setDrivers([])
        } finally {
            setIsLoading(false)
        }
    }

    // Small utility: uploads a File to the `license_info` bucket and returns the public URL
    const uploadToStorage = async (file: File, folder: string): Promise<string | null> => {
        try {
            setIsUploading(true)
            setUploadingField(folder)

            const bucket = 'license_info'
            
            // Check if bucket exists, create if not
            const { data: buckets } = await supabase.storage.listBuckets()
            const bucketExists = buckets?.some(b => b.name === bucket)
            
            if (!bucketExists) {
                const { error: createError } = await supabase.storage.createBucket(bucket, {
                    public: true,
                    allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                })
                if (createError) {
                    console.error('Failed to create bucket:', createError)
                    toast.error('Failed to create storage bucket')
                    return null
                }
            }

            const ext = (file.name.split('.').pop() ?? 'bin')
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const filePath = `${folder}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { cacheControl: '3600', upsert: false })

            if (uploadError) {
                console.error('upload error:', uploadError.message || uploadError)
                toast.error(`Upload failed: ${uploadError.message || 'Unknown error'}`)
                return null
            }

            const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
            const publicUrl = publicUrlData?.publicUrl ?? null
            if (!publicUrl) {
                toast.error('Failed to get public url')
                return null
            }
            toast.success('File uploaded successfully')
            return publicUrl
        } catch (err: any) {
            console.error('Unexpected upload error:', err)
            toast.error(`Upload error: ${err.message || 'Unknown error'}`)
            return null
        } finally {
            setIsUploading(false)
            setUploadingField(null)
        }
    }

    const handleInputChange = (field: keyof Driver, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // file change helper: uploads immediately and stores public url in form
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Driver, folder: string) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return

        // Basic validation
        const maxSizeMB = 10
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File is too large (max ${maxSizeMB}MB)`)
            return
        }

        const url = await uploadToStorage(file, folder)
        if (url) handleInputChange(field, url)
    }

    const handleDeleteDriver = async (driverId: number) => {
        if (!confirm('Delete driver? This cannot be undone.')) return
        try {
            const { error } = await supabase.from('drivers').delete().eq('id', driverId)
            if (error) throw error
            toast.success('Driver deleted')
            fetchDrivers()
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete driver')
        }
    }

    const handleDeleteEquipment = (id: number) => {
        if (!confirm('Delete equipment?')) return
        setEquipment(prev => prev.filter(e => e.id !== id))
        toast.success('Equipment deleted')
    }

    const startEditDriver = (driver: Driver) => {
        setIsEditing(true)
        setEditingDriverId(driver.id ?? null)
        // Ensure date strings are in yyyy-mm-dd to play nice with <input type="date" />
        const normalizeDate = (d?: string | null) => d ? d.split('T')[0] : null
        setFormData({
            ...driver,
            license_expiry_date: normalizeDate(driver.license_expiry_date),
            pdp_expiry_date: normalizeDate(driver.pdp_expiry_date),
        })
        setIsAddDialogOpen(true)
    }

    const handleViewDriver = (driver: Driver) => {
        setSelectedDriver(driver)
        setIsSheetOpen(true)
    }

    const resetForm = () => {
        setFormData(emptyForm)
        setIsEditing(false)
        setEditingDriverId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isUploading) {
            toast.error('Please wait for file uploads to finish')
            return
        }
        setIsSubmitting(true)

        try {
            // attach current user as created_by if available
            const { data: authUser } = await supabase.auth.getUser()
            const userId = authUser.user?.id ?? null

            const payload: Partial<Driver> = {
                ...formData,
                salary: formData.salary,
                hourly_rate: formData.hourly_rate,
                created_by: formData.created_by ?? userId,
            }

            if (isEditing && editingDriverId) {
                const { error } = await supabase
                    .from('drivers')
                    .update(payload)
                    .eq('id', editingDriverId)

                if (error) throw error
                toast.success('Driver updated')
            } else {
                const { error } = await supabase
                    .from('drivers')
                    .insert(payload as any)

                if (error) throw error
                toast.success('Driver added')
            }

            setIsAddDialogOpen(false)
            resetForm()
            fetchDrivers()
        } catch (err: any) {
            console.error('submit error:', err)
            toast.error(`Failed to save driver: ${err.message || 'Unknown error'}`)
            if (err.message?.includes('row-level security')) {
                toast.error('Permission denied. Please check your access rights.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-'
        try {
            return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        } catch (err) {
            return dateString
        }
    }

    const getStatusBadge = (saIssued?: boolean) => {
        return saIssued ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">SA Issued</Badge> : <Badge variant="secondary">Foreign</Badge>
    }

    const getPDPStatusBadge = (hasPDP?: boolean) => {
        return hasPDP ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Has PDP</Badge> : <Badge variant="secondary">No PDP</Badge>
    }

    const filteredDrivers = drivers.filter((driver) => {
        const term = searchTerm.toLowerCase()
        const matchesSearch = (
            (driver.first_name ?? '').toLowerCase().includes(term) ||
            (driver.surname ?? '').toLowerCase().includes(term) ||
            (driver.id_or_passport_number ?? '').toLowerCase().includes(term) ||
            (driver.email_address ?? '').toLowerCase().includes(term) ||
            (driver.cell_number ?? '').toLowerCase().includes(term)
        )

        const matchesFilter = licenseFilter === 'all' || (licenseFilter === 'sa' && driver.sa_issued) || (licenseFilter === 'foreign' && !driver.sa_issued)

        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-6">


            {/* Tab Navigation - full width container */}
            <div className="w-full bg-white">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-1 p-1">
                        <button
                            onClick={() => setActiveTab('drivers-management')}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === 'drivers-management'
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Driver Management</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('executive-dashboard')}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === 'executive-dashboard'
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Executive Dashboard</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('drivers-performance')}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === 'drivers-performance'
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            <span>Driver Performance</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('driver-monitoring-config')}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === 'driver-monitoring-config'
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Driver Monitoring Config</span>
                        </button>

                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'drivers-management' && (
                        <div className="space-y-6">
                            {/* Add Driver Button */}
                            <div className="flex justify-end">

                                <Dialog.Root open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm() }}>
                                    <Dialog.Trigger asChild>
                                        <SecureButton page="drivers" action="create" className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Driver
                                        </SecureButton>
                                    </Dialog.Trigger>

                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl border border-gray-300 z-50 overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="flex justify-center items-center bg-slate-700 rounded-lg w-8 h-8">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <Dialog.Title className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Driver' : 'Add New Driver'}</Dialog.Title>
                                        <p className="text-slate-600 text-xs">Complete the form below</p>
                                    </div>
                                </div>
                                <Dialog.Close asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </Dialog.Close>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Personal Information */}
                            <div className="bg-slate-50 rounded-md p-4 border border-slate-200">
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="flex justify-center items-center bg-slate-600 rounded w-6 h-6">
                                        <Users className="w-3 h-3 text-white" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800">Personal Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input id="first_name" value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} required />
                                    </div>

                                    <div>
                                        <Label htmlFor="surname">Surname *</Label>
                                        <Input id="surname" value={formData.surname || ''} onChange={(e) => handleInputChange('surname', e.target.value)} required />
                                    </div>

                                    <div>
                                        <Label htmlFor="id_or_passport_number">ID/Passport Number *</Label>
                                        <Input id="id_or_passport_number" value={formData.id_or_passport_number || ''} onChange={(e) => handleInputChange('id_or_passport_number', e.target.value)} required />
                                    </div>

                                    <div>
                                        <Label htmlFor="id_or_passport_document">ID/Passport Document</Label>
                                        <Input id="id_or_passport_document" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleFileChange(e, 'id_or_passport_document', 'documents')} />
                                        {formData.id_or_passport_document && (
                                            <div className="mt-1">
                                                <a href={formData.id_or_passport_document} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">📄 View document</a>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email_address">Email Address</Label>
                                        <Input id="email_address" type="email" value={formData.email_address || ''} onChange={(e) => handleInputChange('email_address', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="cell_number">Cell Number</Label>
                                        <Input id="cell_number" value={formData.cell_number || ''} onChange={(e) => handleInputChange('cell_number', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="salary">Monthly Salary/Cost (R)</Label>
                                        <Input id="salary" type="text" inputMode="decimal" value={formData.salary?.toString() || ''} onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9.]/g, '')
                                            const salary = value && !isNaN(Number(value)) ? Number(value) : null
                                            handleInputChange('salary', salary)
                                            handleInputChange('hourly_rate', salary && salary > 0 ? Number((salary / 160).toFixed(2)) : null)
                                        }} placeholder="0.00" />
                                    </div>

                                    <div>
                                        <Label htmlFor="hourly_rate">Hourly Rate (R)</Label>
                                        <Input id="hourly_rate" type="text" value={formData.hourly_rate?.toFixed(2) || ''} readOnly className="bg-gray-50" placeholder="Auto-calculated" />
                                    </div>
                                </div>
                            </div>

                            {/* License Information */}
                            <div className="bg-slate-50 rounded-md p-4 border border-slate-200">
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="flex justify-center items-center bg-slate-600 rounded w-6 h-6">
                                        <Edit className="w-3 h-3 text-white" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800">License Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="sa_issued" checked={!!formData.sa_issued} onCheckedChange={(checked) => handleInputChange('sa_issued', checked)} />
                                        <Label htmlFor="sa_issued">SA Issued License</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="work_permit_upload">Work Permit (PDF / DOC / Image)</Label>
                                        <Input id="work_permit_upload" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleFileChange(e, 'work_permit_upload', 'documents')} />
                                        {formData.work_permit_upload ? (
                                            <div className="mt-2">
                                                <a href={formData.work_permit_upload} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">📄 View uploaded work permit</a>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div>
                                        <Label htmlFor="license_number">License Number</Label>
                                        <Input id="license_number" value={formData.license_number || ''} onChange={(e) => handleInputChange('license_number', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="license_expiry_date">License Expiry Date</Label>
                                        <Input id="license_expiry_date" type="date" value={formData.license_expiry_date || ''} onChange={(e) => handleInputChange('license_expiry_date', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="license_code">License Code</Label>
                                        <Select onValueChange={(v) => handleInputChange('license_code', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={formData.license_code ?? 'Select license code'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A1">A1 - Motorcycle</SelectItem>
                                                <SelectItem value="A">A - Motorcycle</SelectItem>
                                                <SelectItem value="B">B - Light Motor Vehicle</SelectItem>
                                                <SelectItem value="C1">C1 - Light Commercial Vehicle</SelectItem>
                                                <SelectItem value="C">C - Heavy Commercial Vehicle</SelectItem>
                                                <SelectItem value="EB">EB - Heavy Commercial Vehicle with Trailer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="driver_restriction_code">Driver Restriction Code</Label>
                                        <Input id="driver_restriction_code" value={formData.driver_restriction_code || ''} onChange={(e) => handleInputChange('driver_restriction_code', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="vehicle_restriction_code">Vehicle Restriction Code</Label>
                                        <Input id="vehicle_restriction_code" value={formData.vehicle_restriction_code || ''} onChange={(e) => handleInputChange('vehicle_restriction_code', e.target.value)} />
                                    </div>

                                    <div>
                                        <Label htmlFor="front_of_driver_pic">Front of Driver License (image)</Label>
                                        <Input id="front_of_driver_pic" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front_of_driver_pic', 'license_images')} />
                                        {formData.front_of_driver_pic ? (
                                            <img src={formData.front_of_driver_pic} alt="front" className="mt-2 w-40 rounded-lg border" />
                                        ) : null}
                                    </div>

                                    <div>
                                        <Label htmlFor="rear_of_driver_pic">Rear of Driver License (image)</Label>
                                        <Input id="rear_of_driver_pic" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'rear_of_driver_pic', 'license_images')} />
                                        {formData.rear_of_driver_pic ? (
                                            <img src={formData.rear_of_driver_pic} alt="rear" className="mt-2 w-40 rounded-lg border" />
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Professional Driving Permit */}
                            <div className="bg-slate-50 rounded-md p-4 border border-slate-200">
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="flex justify-center items-center bg-slate-600 rounded w-6 h-6">
                                        <Star className="w-3 h-3 text-white" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800">Professional Driving Permit</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="professional_driving_permit" checked={!!formData.professional_driving_permit} onCheckedChange={(checked) => handleInputChange('professional_driving_permit', checked)} />
                                        <Label htmlFor="professional_driving_permit">Has Professional Driving Permit</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="pdp_expiry_date">PDP Expiry Date</Label>
                                        <Input id="pdp_expiry_date" type="date" value={formData.pdp_expiry_date || ''} onChange={(e) => handleInputChange('pdp_expiry_date', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                                <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm() }} disabled={isSubmitting} className="text-slate-600 border-slate-300">Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || isUploading} className="bg-slate-700 hover:bg-slate-800 text-white">
                                    {isSubmitting ? 'Saving...' : (isEditing ? 'Update Driver' : 'Add Driver')}
                                </Button>
                            </div>
                        </form>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                                <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><span className="text-blue-600 text-sm font-semibold">🚗</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">SA Licensed</p>
                                <p className="text-2xl font-bold text-green-600">{drivers.filter(d => d.sa_issued).length}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-green-600 text-sm font-semibold">✓</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active PDP</p>
                                <p className="text-2xl font-bold text-purple-600">{drivers.filter(d => d.professional_driving_permit && d.pdp_expiry_date && new Date(d.pdp_expiry_date) > new Date()).length}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-purple-600 text-sm font-semibold">🎫</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                                <p className="text-2xl font-bold text-orange-600">{drivers.filter(d => { if (!d.license_expiry_date) return false; const expiryDate = new Date(d.license_expiry_date); const thirtyDaysFromNow = new Date(); thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30); return expiryDate <= thirtyDaysFromNow && expiryDate > new Date() }).length}</p>
                            </div>
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><span className="text-orange-600 text-sm font-semibold">⚠</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input type="text" placeholder="Search drivers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant={licenseFilter === 'all' ? 'default' : 'outline'} onClick={() => setLicenseFilter('all')}>All</Button>
                            <Button variant={licenseFilter === 'sa' ? 'default' : 'outline'} onClick={() => setLicenseFilter('sa')}>SA Issued</Button>
                            <Button variant={licenseFilter === 'foreign' ? 'default' : 'outline'} onClick={() => setLicenseFilter('foreign')}>Foreign</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Drivers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Driver Database</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold">Driver Code</TableHead>
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold">ID/Passport Document</TableHead>
                                    {/* <TableHead className="font-semibold">Passport Status</TableHead> */}
                                    {/* <TableHead className="font-semibold">Passport Expiry</TableHead> */}
                                    <TableHead className="font-semibold">Cell Number</TableHead>
                                    <TableHead className="font-semibold">PDP Expiry Date</TableHead>
                                    {/* <TableHead className="font-semibold">License Expiry Date</TableHead> */}
                                    <TableHead className="font-semibold">HazCam Date</TableHead>
                                    <TableHead className="font-semibold">Medic Exam Date</TableHead>
                                    <TableHead className="font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span className="ml-2">Loading drivers...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : drivers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-gray-500">No drivers found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDrivers.map((driver) => (
                                        <TableRow key={driver.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="text-sm">{driver.driver_restriction_code || '-'}</TableCell>
                                            <TableCell className="text-sm font-medium">{driver.surname}</TableCell>
                                            <TableCell className="text-sm">{driver.id_or_passport_document || '-'}</TableCell>
                                            {/* <TableCell className="text-sm">{driver.passport_status || '-'}</TableCell> */}
                                            {/* <TableCell className="text-sm">{formatDate(driver.passport_expiry)}</TableCell> */}
                                            <TableCell className="text-sm">{driver.cell_number || '-'}</TableCell>
                                            <TableCell className="text-sm">{formatDate(driver.pdp_expiry_date)}</TableCell>
                                            {/* <TableCell className="text-sm">{formatDate(driver.license_expiry_date)}</TableCell> */}
                                            <TableCell className="text-sm">{formatDate(driver.hazCamDate)}</TableCell>
                                            <TableCell className="text-sm">{formatDate(driver.medic_exam_date)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" onClick={() => handleViewDriver(driver)}>View</Button>
                                                    <SecureButton page="drivers" action="edit" size="sm" variant="outline" onClick={() => startEditDriver(driver)}>Edit</SecureButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Driver Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="p-4 w-11/12 md:w-2/4 h-screen overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Driver Details</SheetTitle>
                    </SheetHeader>

                    {selectedDriver && (
                        <div className="space-y-4 mt-6 pb-20">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">First Name</p>
                                        <p className="text-gray-900">{selectedDriver.first_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Surname</p>
                                        <p className="text-gray-900">{selectedDriver.surname}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">ID Number</p>
                                        <p className="text-gray-900">{selectedDriver.id_or_passport_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Email</p>
                                        <p className="text-gray-900">
                                            {selectedDriver.email_address || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Cell Number</p>
                                        <p className="text-gray-900">
                                            {selectedDriver.cell_number || "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* License Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    License Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">License Number</p>
                                        <p className="text-gray-900">
                                            {selectedDriver.license_number || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">License Code</p>
                                        <p className="text-gray-900">
                                            {selectedDriver.license_code || "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">License Expiry</p>
                                        <p className="text-gray-900">
                                            {formatDate(selectedDriver.license_expiry_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">SA Issued</p>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedDriver.sa_issued)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Driving Permit */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Professional Driving Permit
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Has PDP</p>
                                        <div className="mt-1">
                                            {getPDPStatusBadge(
                                                selectedDriver.professional_driving_permit
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">PDP Expiry</p>
                                        <p className="text-gray-900">
                                            {formatDate(selectedDriver.pdp_expiry_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Additional Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Driver Restriction Code</p>
                                        <p className="text-gray-900">{selectedDriver.driver_restriction_code || "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Passport Status</p>
                                        <p className="text-gray-900">{selectedDriver.passport_status || "Not set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Passport Date</p>
                                        <p className="text-gray-900">{formatDate(selectedDriver.passport_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Passport Expiry</p>
                                        <p className="text-gray-900">{formatDate(selectedDriver.passport_expiry)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Appointment Date</p>
                                        <p className="text-gray-900">{formatDate(selectedDriver.apointment_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">HazCam Date</p>
                                        <p className="text-gray-900">{formatDate(selectedDriver.hazCamDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Medical Exam Date</p>
                                        <p className="text-gray-900">{formatDate(selectedDriver.medic_exam_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">POP</p>
                                        <p className="text-gray-900">{selectedDriver.pop || "Not set"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Work Permit</p>
                                        {selectedDriver.work_permit_upload ? (
                                            <a
                                                href={selectedDriver.work_permit_upload}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                📄 View Work Permit
                                            </a>
                                        ) : (
                                            <p className="text-gray-500">Not uploaded</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Front of License
                                        </p>
                                        {selectedDriver.front_of_driver_pic ? (
                                            <img
                                                src={selectedDriver.front_of_driver_pic}
                                                alt="Front of License"
                                                className="w-40 rounded-lg border shadow-sm"
                                            />
                                        ) : (
                                            <p className="text-gray-500">Not uploaded</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Rear of License
                                        </p>
                                        {selectedDriver.rear_of_driver_pic ? (
                                            <img
                                                src={selectedDriver.rear_of_driver_pic}
                                                alt="Rear of License"
                                                className="w-40 rounded-lg border shadow-sm"
                                            />
                                        ) : (
                                            <p className="text-gray-500">Not uploaded</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            startEditDriver(selectedDriver);
                                            setIsSheetOpen(false);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            selectedDriver.id && handleDeleteDriver(selectedDriver.id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
                        </div>
                    )}

                    {activeTab === 'executive-dashboard' && (
                        <div className="space-y-6">
                            {/* Chart Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ViolationsChart />
                                <SpeedingViolationsChart />
                            </div>
                            
                            {/* Full Executive Dashboard */}
                            <ExecutiveDashboardEPS />
                        </div>
                    )}

                    {activeTab === 'executive-dashboard-old' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-cyan-50 shadow-lg p-6 border border-blue-200 rounded-lg text-slate-800">
                                <h1 className="font-bold text-2xl text-center">EPS Courier Services - Executive Dashboard</h1>
                            </div>

                            {/* Executive Charts */}
                            <div>
                                <MaterialCharts biWeeklyData={biWeeklyData} dailyStats={dailyStats} />
                            </div>

                            {/* Monthly Event Count (Executive) */}
                            <Card className="p-4">
                                <h3 className="mb-2 font-semibold text-sm text-center">Monthly Event Count</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-2 py-1 border text-left">Event</th>
                                                <th className="px-2 py-1 border text-center">July</th>
                                                <th className="px-2 py-1 border text-center">August</th>
                                                <th className="px-2 py-1 border text-center">September</th>
                                                <th className="px-2 py-1 border text-center">October</th>
                                                <th className="px-2 py-1 border text-center">November</th>
                                                <th className="px-2 py-1 border text-center">December</th>
                                                <th className="px-2 py-1 border text-center">January</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y">
                                            <tr>
                                                <td className="px-2 py-1 border">Speeding &gt; 85 km/h</td>
                                                <td className="px-2 py-1 border text-center">1651</td>
                                                <td className="px-2 py-1 border text-center">1778</td>
                                                <td className="px-2 py-1 border text-center">1838</td>
                                                <td className="px-2 py-1 border text-center">1528</td>
                                                <td className="px-2 py-1 border text-center">1536</td>
                                                <td className="px-2 py-1 border text-center">1327</td>
                                                <td className="px-2 py-1 border text-center">1209</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Harsh Braking</td>
                                                <td className="px-2 py-1 border text-center">2981</td>
                                                <td className="px-2 py-1 border text-center">2626</td>
                                                <td className="px-2 py-1 border text-center">5633</td>
                                                <td className="px-2 py-1 border text-center">6672</td>
                                                <td className="px-2 py-1 border text-center">2980</td>
                                                <td className="px-2 py-1 border text-center">2501</td>
                                                <td className="px-2 py-1 border text-center">2525</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Total Harsh Accel. Count</td>
                                                <td className="px-2 py-1 border text-center">8488</td>
                                                <td className="px-2 py-1 border text-center">8650</td>
                                                <td className="px-2 py-1 border text-center">8783</td>
                                                <td className="px-2 py-1 border text-center">9171</td>
                                                <td className="px-2 py-1 border text-center">12004</td>
                                                <td className="px-2 py-1 border text-center">9987</td>
                                                <td className="px-2 py-1 border text-center">9587</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Excessive Day</td>
                                                <td className="px-2 py-1 border text-center">474</td>
                                                <td className="px-2 py-1 border text-center">485</td>
                                                <td className="px-2 py-1 border text-center">409</td>
                                                <td className="px-2 py-1 border text-center">396</td>
                                                <td className="px-2 py-1 border text-center">376</td>
                                                <td className="px-2 py-1 border text-center">341</td>
                                                <td className="px-2 py-1 border text-center">290</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Excessive Night</td>
                                                <td className="px-2 py-1 border text-center">624</td>
                                                <td className="px-2 py-1 border text-center">670</td>
                                                <td className="px-2 py-1 border text-center">606</td>
                                                <td className="px-2 py-1 border text-center">640</td>
                                                <td className="px-2 py-1 border text-center">642</td>
                                                <td className="px-2 py-1 border text-center">524</td>
                                                <td className="px-2 py-1 border text-center">504</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Night Time Driving (hrs)</td>
                                                <td className="px-2 py-1 border text-center">462</td>
                                                <td className="px-2 py-1 border text-center">552</td>
                                                <td className="px-2 py-1 border text-center">487</td>
                                                <td className="px-2 py-1 border text-center">537</td>
                                                <td className="px-2 py-1 border text-center">503</td>
                                                <td className="px-2 py-1 border text-center">426</td>
                                                <td className="px-2 py-1 border text-center">413</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Total over RPM Count</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Total Idle &gt; 10 min Count</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Kilometres</td>
                                                <td className="px-2 py-1 border text-center">690,019</td>
                                                <td className="px-2 py-1 border text-center">728,783</td>
                                                <td className="px-2 py-1 border text-center">710,921</td>
                                                <td className="px-2 py-1 border text-center">745,486</td>
                                                <td className="px-2 py-1 border text-center">733,432</td>
                                                <td className="px-2 py-1 border text-center">619,449</td>
                                                <td className="px-2 py-1 border text-center">569,940</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Fleet Size</td>
                                                <td className="px-2 py-1 border text-center">82</td>
                                                <td className="px-2 py-1 border text-center">85</td>
                                                <td className="px-2 py-1 border text-center">83</td>
                                                <td className="px-2 py-1 border text-center">82</td>
                                                <td className="px-2 py-1 border text-center">84</td>
                                                <td className="px-2 py-1 border text-center">77</td>
                                                <td className="px-2 py-1 border text-center">97</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Vehicles Reporting</td>
                                                <td className="px-2 py-1 border text-center">82</td>
                                                <td className="px-2 py-1 border text-center">85</td>
                                                <td className="px-2 py-1 border text-center">83</td>
                                                <td className="px-2 py-1 border text-center">82</td>
                                                <td className="px-2 py-1 border text-center">84</td>
                                                <td className="px-2 py-1 border text-center">77</td>
                                                <td className="px-2 py-1 border text-center">96</td>
                                            </tr>
                                            <tr>
                                                <td className="px-2 py-1 border">Vehicles Not Reporting</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">0</td>
                                                <td className="px-2 py-1 border text-center">1</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Monthly Statistics Table */}
                            <Card className="p-6">
                                <h3 className="mb-4 font-semibold text-lg text-center">Monthly Fleet Statistics</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Month</th>
                                                <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-center uppercase tracking-wider">Kilometres</th>
                                                <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-center uppercase tracking-wider">Trips</th>
                                                <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-center uppercase tracking-wider">Risk Events</th>
                                                <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-center uppercase tracking-wider">Performance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr className="hover:bg-cyan-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">August</td>
                                                <td className="px-6 py-4 text-center text-sm">729,751</td>
                                                <td className="px-6 py-4 text-center text-sm">28,671</td>
                                                <td className="px-6 py-4 text-center text-sm">12</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-xs">Good</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-cyan-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">September</td>
                                                <td className="px-6 py-4 text-center text-sm">745,448</td>
                                                <td className="px-6 py-4 text-center text-sm">30,876</td>
                                                <td className="px-6 py-4 text-center text-sm">8</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-xs">Excellent</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-cyan-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">October</td>
                                                <td className="px-6 py-4 text-center text-sm">733,432</td>
                                                <td className="px-6 py-4 text-center text-sm">33,858</td>
                                                <td className="px-6 py-4 text-center text-sm">15</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-yellow-100 px-2.5 py-0.5 rounded-full font-medium text-yellow-800 text-xs">Average</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-cyan-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">November</td>
                                                <td className="px-6 py-4 text-center text-sm">649,340</td>
                                                <td className="px-6 py-4 text-center text-sm">33,008</td>
                                                <td className="px-6 py-4 text-center text-sm">18</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-yellow-100 px-2.5 py-0.5 rounded-full font-medium text-yellow-800 text-xs">Average</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-cyan-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">December</td>
                                                <td className="px-6 py-4 text-center text-sm">549,840</td>
                                                <td className="px-6 py-4 text-center text-sm">26,785</td>
                                                <td className="px-6 py-4 text-center text-sm">22</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">Poor</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Top Speeding Offenders */}
                            <Card className="p-6">
                                <h3 className="mb-4 font-semibold text-lg text-center">Top Speeding Offenders</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-red-50 to-orange-50">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-red-700 text-xs text-left uppercase tracking-wider">Driver Name</th>
                                                <th className="px-6 py-4 font-semibold text-red-700 text-xs text-center uppercase tracking-wider">Violations</th>
                                                <th className="px-6 py-4 font-semibold text-red-700 text-xs text-center uppercase tracking-wider">Risk Level</th>
                                                <th className="px-6 py-4 font-semibold text-red-700 text-xs text-center uppercase tracking-wider">Action Required</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr className="hover:bg-red-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">ZARAFENDHOSA SWAMUTHI</td>
                                                <td className="px-6 py-4 text-center text-sm">
                                                    <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">15</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">High</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                                                        Training Required
                                                    </Button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-red-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">NQOBANE</td>
                                                <td className="px-6 py-4 text-center text-sm">
                                                    <span className="inline-flex items-center bg-orange-100 px-2.5 py-0.5 rounded-full font-medium text-orange-800 text-xs">12</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-orange-100 px-2.5 py-0.5 rounded-full font-medium text-orange-800 text-xs">Medium</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                                                        Warning Issued
                                                    </Button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-red-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">NQOBILE MONDO</td>
                                                <td className="px-6 py-4 text-center text-sm">
                                                    <span className="inline-flex items-center bg-yellow-100 px-2.5 py-0.5 rounded-full font-medium text-yellow-800 text-xs">10</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-yellow-100 px-2.5 py-0.5 rounded-full font-medium text-yellow-800 text-xs">Medium</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                                        Monitor
                                                    </Button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-red-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 text-sm">SIFISO</td>
                                                <td className="px-6 py-4 text-center text-sm">
                                                    <span className="inline-flex items-center bg-yellow-100 px-2.5 py-0.5 rounded-full font-medium text-yellow-800 text-xs">8</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-xs">Low</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                                                        Good Standing
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* Overall Risk Score Bar Chart */}
                            <Card className="p-6">
                                <h3 className="mb-4 font-semibold text-purple-800 text-lg text-center">Overall Risk Score by Month</h3>
                                <div className="h-80">
                                    <div className="grid grid-cols-6 gap-4 h-full items-end">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-teal-500 w-12 rounded-t" style={{height: '29%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600">July</span>
                                            <span className="text-xs text-gray-500">29</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-teal-500 w-12 rounded-t" style={{height: '26%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600">Aug</span>
                                            <span className="text-xs text-gray-500">26</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-teal-500 w-12 rounded-t" style={{height: '26%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600">Sep</span>
                                            <span className="text-xs text-gray-500">26</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-teal-500 w-12 rounded-t" style={{height: '26%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600">Oct</span>
                                            <span className="text-xs text-gray-500">26</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-teal-500 w-12 rounded-t" style={{height: '26%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600">Nov</span>
                                            <span className="text-xs text-gray-500">26</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-teal-500 w-12 rounded-t" style={{height: '20%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600">Dec</span>
                                            <span className="text-xs text-gray-500">20</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Driver Performance Bar Chart */}
                            <Card className="p-6">
                                <h3 className="mb-4 font-semibold text-lg text-center">Driver Performance Scores</h3>
                                <div className="h-64">
                                    <div className="grid grid-cols-5 gap-4 h-full items-end">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-blue-500 w-16 rounded-t" style={{height: '85%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600 text-center">AMOS NTSAKO</span>
                                            <span className="text-xs text-gray-500">85%</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-green-500 w-16 rounded-t" style={{height: '78%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600 text-center">ANDRIES HABOFANOE</span>
                                            <span className="text-xs text-gray-500">78%</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-yellow-500 w-16 rounded-t" style={{height: '72%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600 text-center">AVHATAKALI</span>
                                            <span className="text-xs text-gray-500">72%</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-red-500 w-16 rounded-t" style={{height: '68%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600 text-center">BANDILE LOREN</span>
                                            <span className="text-xs text-gray-500">68%</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-purple-500 w-16 rounded-t" style={{height: '82%'}}></div>
                                            <span className="text-xs mt-2 text-gray-600 text-center">BANNANA</span>
                                            <span className="text-xs text-gray-500">82%</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'drivers-performance' && (
                        <div className="space-y-6">
                            <DriverPerformanceDashboard />
                        </div>
                    )}

                    {activeTab === 'driver-monitoring-config' && (
                        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Criterion</th>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Selected Weighting</th>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Actual Weighting</th>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Risk Tiers</th>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">No. Incidents</th>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Statuses</th>
                                            <th className="px-6 py-4 font-semibold text-cyan-700 text-xs text-left uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr className="bg-white hover:bg-cyan-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">Speeding</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">50.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">50.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">4</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                                <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">4</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm">
                                                <div className="space-y-1">
                                                    <div className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs">Speed Exception 1</div>
                                                    <div className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs">Speed Exception 2</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="bg-slate-50 hover:bg-cyan-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">Harsh Accelerating</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">4</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                                <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">8</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm">
                                                <div className="space-y-1">
                                                    <div className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs">Safety - Acceleration - Aggressive</div>
                                                    <div className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs">Safety - Acceleration - Dangerous</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="bg-white hover:bg-cyan-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">Night Time Driving</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">4</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                                <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">4</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm">
                                                <span className="text-gray-400">-</span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="bg-slate-50 hover:bg-cyan-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">Excessive day</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">4</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                                <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">15</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm">
                                                <span className="text-gray-400">-</span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="bg-white hover:bg-cyan-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">Harsh Braking</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">10.0</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">4</td>
                                            <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                                                <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-medium text-red-800 text-xs">20</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 text-sm">
                                                <div className="space-y-1">
                                                    <div className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs">Safety - Braking - Dangerous</div>
                                                    <div className="bg-blue-100 px-2 py-1 rounded-md text-blue-800 text-xs">Safety - Braking - Aggressive</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 shadow-md hover:shadow-lg p-0 rounded-full w-8 h-8 text-white transition-all duration-200">
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    )
}

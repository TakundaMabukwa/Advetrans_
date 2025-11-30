"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Phone,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Search,
  Plus,
  User,
  Wrench,
  Battery,
  Zap,
  Settings,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { assignJob } from "@/lib/action/assign"
import { addTechnician } from "@/lib/action/assign"
import { MorphingDialogBasicOne } from "@/components/map/advanceMap"
import { DeleteUser } from "@/lib/action/manageUser"

interface Technician {
  id: number
  name: string
  phone: string
  email: string
  location: string
  coordinates: { lat: number; lng: number }
  availability: "available" | "busy" | "off-duty" | "emergency"
  specialties: string[]
  skill_levels: {
    electrical: number
    mechanical: number
    hydraulic: number
    diagnostic: number
  }
  rating: number
  // completedJobs: number
  // responseTime: string
  job_allocation?: JobAssignment
  joinDate: string
  certifications: string[]
  vehicleType: string
  equipmentLevel: "basic" | "advanced" | "specialist"
  assignedJobs?: JobAssignment[]
  type: 'internal' | 'external'
}

interface JobAssignment {
  id: number
  job_id: string
  description: string
  location: string
  priority: "low" | "medium" | "high" | "emergency"
  status: string
  assigned_technician?: string
  created_at: string
  updated_at?: string
  technician_id: number
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [availableJobs, setAvailableJobs] = useState<JobAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobAssignment | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isAddTechnicianOpen, setIsAddTechnicianOpen] = useState(false)

  // Form state for adding technician
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    coordinates: { lat: 0, lng: 0 },
    specialties: [] as string[],
    skillLevels: {
      electrical: 0,
      mechanical: 0,
      hydraulic: 0,
      diagnostic: 0,
    },
    rating: 0,
    joinDate: new Date().toISOString().split('T')[0],
    certifications: [] as string[],
    vehicleType: "",
    equipmentLevel: "basic" as "basic" | "advanced" | "specialist",
    availability: "available" as "available" | "busy" | "off-duty" | "emergency"
  })

  const [newSpecialty, setNewSpecialty] = useState("")
  const [newCertification, setNewCertification] = useState("")

  // Add job search state for filtering jobs in the assign dialog
  const [jobSearchTerm, setJobSearchTerm] = useState("")

  const supabase = createClient()

  const refreshData = async () => {
    // Fetch technicians
    const { data: techniciansData, error: techError } = await supabase
      .from('technicians')
      .select('*')
      .neq('isActive', false)
    if (techError) {
      console.error('Error fetching technicians:', techError)
      setTechnicians([])
      return
    }

    // Fetch all job assignments
    const { data: assignmentsData, error: assignError } = await supabase
      .from('job_assignments')
      .select('*')
    if (assignError) {
      console.error('Error fetching job assignments:', assignError)
    }

    // Fetch all assignements
    const { data: assignementsData, error: assignementsError } = await supabase
      .from('assignements')
      .select('*')
    if (assignementsError) {
      console.error('Error fetching assignements:', assignementsError)
    }

    // Attach assigned jobs to each technician based on assignements table
    const techniciansWithJobs = (techniciansData || []).map((tech: any) => {
      // Find all assignements for this technician
      const techAssignements = (assignementsData || []).filter((a: any) => a.tech_id === tech.id)
      // For each assignement, find the corresponding job assignment
      const assignedJobs = techAssignements.map((a: any) =>
        (assignmentsData || []).find((job: any) => job.id === a.job_id)
      ).filter(Boolean)
      return {
        ...tech,
        assignedJobs,
      }
    })
    setTechnicians(techniciansWithJobs as Technician[])

    // Fetch available jobs (not assigned to any technician)
    const { data: jobs, error: jobsError } = await supabase
      .from('job_assignments')
      .select('*')
    if (jobsError) {
      console.error('Error fetching available jobs:', jobsError)
    } else {
      setAvailableJobs((jobs || []) as unknown as JobAssignment[])
      console.log('Available jobs:', jobs)
    }
  }

  useEffect(() => {

    const jobAssignments = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_assignments' },
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()
    refreshData()

    return () => {
      jobAssignments.unsubscribe;
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-orange-100 text-orange-800"
      case "off-duty":
        return "bg-gray-100 text-gray-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "electrical":
        return <Zap className="h-4 w-4" />
      case "mechanical":
        return <Wrench className="h-4 w-4" />
      case "battery service":
        return <Battery className="h-4 w-4" />
      case "diagnostic":
        return <Settings className="h-4 w-4" />
      default:
        return <Wrench className="h-4 w-4" />
    }
  }

  const calculateJobMatch = (technician: Technician, job: JobAssignment) => {
    // Simplified matching since we don't have requiredSkills in the database
    const locationScore = 100 // Simplified - in real app, calculate distance
    const availabilityScore = technician.availability === "available" ? 100 : 0

    return Math.round(locationScore * 0.5 + availabilityScore * 0.5)
  }

  const handleAssignJob = async () => {
    try {
      // const { data, error } = await assignJob(selectedJob)

    } catch (error) {
      console.error('Error assigning job:', error)
      toast.error("Failed to assign job")
    }
  }

  const handleAddTechnician = async () => {
    try {
      const result = await addTechnician({
        id: null,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        coordinates: formData.coordinates,
        availability: formData.availability,
        specialties: formData.specialties,
        skillLevels: formData.skillLevels,
        rating: formData.rating,
        joinDate: formData.joinDate,
        certifications: formData.certifications,
        vehicleType: formData.vehicleType,
        equipmentLevel: formData.equipmentLevel,
        type: "internal",
        created_by: '',
        workshop_id: '',
      })

      if (result && result.success) {
        toast.success("Technician added successfully!")
        setIsAddTechnicianOpen(false)
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          location: "",
          coordinates: { lat: 0, lng: 0 },
          specialties: [],
          skillLevels: {
            electrical: 0,
            mechanical: 0,
            hydraulic: 0,
            diagnostic: 0,
          },
          rating: 0,
          joinDate: new Date().toISOString().split('T')[0],
          certifications: [],
          vehicleType: "",
          equipmentLevel: "basic",
          availability: "available"
        })
        refreshData()
      } else {
        toast.error("Failed to add technician: " + (result?.error ?? "Unknown error"))
      }
    } catch (error) {
      console.error('Error adding technician:', error)
      toast.error("Failed to add technician")
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }))
  }

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || tech.availability === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Technicians</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddTechnicianOpen} onOpenChange={setIsAddTechnicianOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technician
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Technician</DialogTitle>
                  <DialogDescription>Enter technician details to add them to the system</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter full name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="e.g 0612345678"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Base Location *</Label>
                        <Input
                          id="location"
                          placeholder="City/Area"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="joinDate">Join Date *</Label>
                        <Input
                          id="joinDate"
                          type="date"
                          value={formData.joinDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="availability">Availability</Label>
                        <Select
                          value={formData.availability}
                          onValueChange={(value: "available" | "busy" | "off-duty" | "emergency") =>
                            setFormData(prev => ({ ...prev, availability: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="off-duty">Off Duty</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle and Equipment */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vehicle & Equipment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type *</Label>
                        <Input
                          id="vehicleType"
                          placeholder="e.g., Light Truck, Heavy Truck, Van"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="equipmentLevel">Equipment Level</Label>
                        <Select
                          value={formData.equipmentLevel}
                          onValueChange={(value: "basic" | "advanced" | "specialist") =>
                            setFormData(prev => ({ ...prev, equipmentLevel: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="specialist">Specialist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Specialties</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add specialty (e.g., electrical, mechanical, hydraulic)"
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                        />
                        <Button onClick={addSpecialty} type="button">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {specialty}
                            <button
                              onClick={() => removeSpecialty(specialty)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add certification"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                        />
                        <Button onClick={addCertification} type="button">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.certifications.map((certification, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {certification}
                            <Button
                              onClick={() => removeCertification(certification)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skill Levels */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Skill Levels (0-100%)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="electrical">Electrical</Label>
                        <Input
                          id="electrical"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.skillLevels.electrical}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            skillLevels: { ...prev.skillLevels, electrical: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mechanical">Mechanical</Label>
                        <Input
                          id="mechanical"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.skillLevels.mechanical}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            skillLevels: { ...prev.skillLevels, mechanical: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hydraulic">Hydraulic</Label>
                        <Input
                          id="hydraulic"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.skillLevels.hydraulic}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            skillLevels: { ...prev.skillLevels, hydraulic: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diagnostic">Diagnostic</Label>
                        <Input
                          id="diagnostic"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.skillLevels.diagnostic}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            skillLevels: { ...prev.skillLevels, diagnostic: parseInt(e.target.value) || 0 }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rating</h3>
                    <div>
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.01"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          rating: parseFloat(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    className="flex-1"
                    onClick={handleAddTechnician}
                    disabled={!formData.name || !formData.phone || !formData.email || !formData.location || !formData.vehicleType}
                  >
                    Add Technician
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddTechnicianOpen(false)
                      // Reset form
                      setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        location: "",
                        coordinates: { lat: 0, lng: 0 },
                        specialties: [],
                        skillLevels: {
                          electrical: 0,
                          mechanical: 0,
                          hydraulic: 0,
                          diagnostic: 0,
                        },
                        rating: 0,
                        joinDate: new Date().toISOString().split('T')[0],
                        certifications: [],
                        vehicleType: "",
                        equipmentLevel: "basic",
                        availability: "available"
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="directory">Technician Directory</TabsTrigger>
            {/* <TabsTrigger value="assignments">Job Assignments</TabsTrigger> */}
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTechnicians.map((technician) => (
                <Card key={technician.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{technician.name} :
                            <Badge className={getStatusColor(technician.availability)}>
                              {technician.availability}
                            </Badge>
                          </CardTitle>
                          <div className="flex flex-row gap-4">
                            <p>{technician.id} </p> : <p>{technician.type.toUpperCase()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{technician?.rating}</span>

                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          await DeleteUser({ email: technician.email });
                          alert("Delected")
                          refreshData();
                        }}
                      >
                        <Trash2 size={20} color="white" />
                      </Button>


                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{technician.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{technician.location}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {technician.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {getSkillIcon(specialty)}
                            <span className="ml-1">{specialty}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Skill Levels</h4>
                      <div className="space-y-2">
                        {technician.skill_levels && Object.entries(technician.skill_levels).map(([skill, level]) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{skill}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${level}%` }}></div>
                              </div>
                              {/* <span className="text-xs text-gray-500">{level}%</span> */}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Completed Jobs</span>
                          <p className="font-semibold">{technician.completedJobs}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Response Time</span>
                          <p className="font-semibold">{technician.responseTime}</p>
                        </div>
                      </div> */}



                    <div className="flex gap-2">
                      {/* Tracking Map */}
                      <div className="flex-1 bg-transparent">
                        <MorphingDialogBasicOne name={technician.name} location={technician.location} />
                      </div>

                      {/* Always show Assign Job button */}
                      <Dialog open={isAssignDialogOpen && selectedTechnician?.id === technician.id} onOpenChange={setIsAssignDialogOpen}>
                        <DialogTrigger>
                          <Button size="sm" className="w-fit" onClick={() => setSelectedTechnician(technician)}>
                            Assigned Jobs
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Assigned Jobs to {technician.name}</DialogTitle>
                            <DialogDescription>View all job to assign to this technician</DialogDescription>
                          </DialogHeader>
                          {/* Job search input */}
                          <Input
                            placeholder="Search jobs..."
                            value={jobSearchTerm}
                            onChange={(e) => setJobSearchTerm(e.target.value)}
                            className="mb-2"
                          />
                          {/* Scrollable jobs list */}
                          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {(availableJobs.filter(job =>
                              String(job.technician_id) === String(technician.id) &&
                              (
                                job.job_id?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                                job.description?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                                job.location?.toLowerCase().includes(jobSearchTerm.toLowerCase())
                              )
                            )).map((job) => {
                              return (
                                <Card key={job.id} className="hover:bg-gray-50">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-semibold">{job.job_id}</h4>
                                        <p className="text-sm text-gray-600">{job.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge className={getPriorityColor(job.priority)}>
                                          {job.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Location:</span>
                                        <p>{job.location}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Duration:</span>
                                        <p>Estimated time not available</p>
                                      </div>
                                    </div>
                                    {/* <CardFooter className="mt-2">
                                                                            <Button variant={"outline"} className="bg-transparent"
                                                                                onClick={async () => {
                                                                                    if (!technician) {
                                                                                        toast.error("No technician selected");
                                                                                        return;
                                                                                    }
                                                                                    if (!job) {
                                                                                        toast.error("No job selected");
                                                                                        return;
                                                                                    }
                                                                                    try {
                                                                                        const { data: existingAssignments, error: fetchError } = await supabase
                                                                                            .from('assignements')
                                                                                            .select('driver_id')
                                                                                            .eq('job_id', job.id)
                                                                                            .single();

                                                                                        if (fetchError) {
                                                                                            console.error('Error fetching existing assignment:', fetchError);
                                                                                        }
                                                                                        const { error } = await supabase
                                                                                            .from('assignements')
                                                                                            .upsert([
                                                                                                {
                                                                                                    job_id: job.id,
                                                                                                    tech_id: technician.id,
                                                                                                    driver_id: existingAssignments?.driver_id || null,
                                                                                                }
                                                                                            ])
                                                                                            .eq('job_id', job.id)
                                                                                        if (error) {
                                                                                            toast.error("Error assigning job: " + error.message);
                                                                                        } else {
                                                                                            toast.success("Job assigned successfully");
                                                                                            // Remove the assigned job from availableJobs immediately
                                                                                            setAvailableJobs(prev => prev.filter(j => j.id !== job.id));
                                                                                            refreshData();
                                                                                            setIsAssignDialogOpen(false);
                                                                                        }
                                                                                    } catch (error) {
                                                                                        console.error("Error assigning job:", error);
                                                                                        toast.error("Error assigning job");
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Assign
                                                                            </Button>
                                                                        </CardFooter> */}
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {/* <div className="mt-2">
                      <h4 className="font-semibold text-sm">Assigned Breakdown:</h4>
                      <ul className="list-disc ml-5 text-xs">
                        {technician.assignedJobs && technician.assignedJobs.length > 0 ? (
                          technician.assignedJobs.map((job: JobAssignment) => (
                            <li key={job.id}>{job.job_id} - {job.description} - {job.status}</li>
                          ))
                        ) : (
                          <li className="text-gray-500">No breakdown assigned to this technician.</li>
                        )}
                      </ul>
                    </div> */}
                    {/* <div className="mt-2">
                      <h4 className="font-semibold text-sm">Assigned Jobs:</h4>
                      <ul className="list-disc ml-5 text-xs">
                        {technician.assignedJobs && technician.assignedJobs.length > 0 ? (
                          technician.assignedJobs.map((job: JobAssignment) => (
                            <li key={job.id}>{job.job_id} - {job.description} - {job.status}</li>
                          ))
                        ) : (
                          <li className="text-gray-500">No jobs assigned to this technician.</li>
                        )}
                      </ul>
                    </div> */}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Jobs</CardTitle>
                  <CardDescription>Jobs waiting for technician assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Required Skills</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Best Match</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableJobs.map((job) => {
                        const bestMatch = technicians
                          .filter((t) => t.availability === "available")
                          .map((t) => ({ technician: t, score: calculateJobMatch(t, job) }))
                          .sort((a, b) => b.score - a.score)[0]

                        return (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.job_id}</TableCell>
                            <TableCell>{job.description}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(job.priority)}>{job.priority.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {job.requiredSkills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{job.estimatedDuration}</TableCell>
                            <TableCell>
                              {bestMatch && (
                                <div className="text-sm">
                                  <p className="font-medium">{bestMatch.technician.name}</p>
                                  <p className="text-gray-500">{bestMatch.score}% match</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {bestMatch && (
                                <Button size="sm" onClick={() => handleAssignJob(bestMatch.technician.id, job.id)}>
                                  Auto Assign
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent> */}

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{technicians.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {technicians.filter((t) => t.availability === "available").length} available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(technicians.reduce((sum, t) => sum + t.rating, 0) / technicians.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all technicians</p>
                </CardContent>
              </Card>
              {/* <Card> */}
              {/* <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader> */}
              {/* <CardContent>
                    <div className="text-2xl font-bold">{technicians.reduce((sum, t) => sum + t.completedJobs, 0)}</div>
                    <p className="text-xs text-muted-foreground">Total completed jobs</p>
                  </CardContent> */}
              {/* </Card> */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">13 min</div>
                  <p className="text-xs text-muted-foreground">Average response time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Technician Performance Ranking</CardTitle>
                <CardDescription>Ranked by overall performance score</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      {/* <TableHead>Completed Jobs</TableHead> */}
                      {/* <TableHead>Response Time</TableHead> */}
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicians
                      .sort((a, b) => b.rating - a.rating)
                      .map((technician, index) => (
                        <TableRow key={technician.id}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{technician.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {technician.rating}
                            </div>
                          </TableCell>
                          {/* <TableCell>{technician.completedJobs}</TableCell>
                            <TableCell>{technician.responseTime}</TableCell> */}
                          <TableCell>
                            <Badge className={getStatusColor(technician.availability)}>
                              {technician.availability}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

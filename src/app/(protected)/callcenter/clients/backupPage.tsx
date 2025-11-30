"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

import { addExternalClient, addSubcontractor, addTowingCompany, ExternalClient, Subcontractor, TowingCompany } from "@/lib/action/addClient";

export default function ExternalClientsPage() {
  const [clients, setClients] = useState<ExternalClient[]>([])
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [towingCompanies, setTowingCompanies] = useState<TowingCompany[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddSubcontractorOpen, setIsAddSubcontractorOpen] = useState(false)
  const [isAddTowingOpen, setIsAddTowingOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<any | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [jobSearchTerm, setJobSearchTerm] = useState("")

  // Fetch all clients from Supabase and split by type
  const fetchClients = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("client").select("*")
    if (error) {
      toast.error("Failed to fetch clients: " + error.message)
      setLoading(false)
      return
    }
    // Split by type
    // @ts-ignore
    setClients((data || []).filter((c: any) => c.client_type === "external"))
    // @ts-expect-error
    setSubcontractors((data || []).filter((c: any) => c.client_type === "subcontractor"))

    // @ts-ignore
    setTowingCompanies((data || []).filter((c: any) => c.client_type === "towing"))
    setLoading(false)
  }

  // Fetch available jobs for assignment
  const fetchAvailableJobs = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("job_assignments")
      .select("*")
      .is("subcontractor_id", null)
      .eq("status", "Breakdown Request")
    if (!error) setAvailableJobs(data || [])
  }

  useEffect(() => {
    fetchClients()
    fetchAvailableJobs()
  }, [])

  // Assignment logic
  async function assignJobToSubcontractor(jobId: number, subcontractorId: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("job_assignments")
      .update({
        subcontractor_id: subcontractorId,
        status: "Breakdown assigned",
      })
      .eq("id", jobId)
    if (error) {
      toast.error("Failed to assign job: " + error.message)
    } else {
      toast.success("Job assigned to subcontractor!")
      fetchAvailableJobs()
      setIsAssignDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "available":
        return "bg-green-100 text-green-800"
      case "inactive":
      case "unavailable":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "busy":
        return "bg-orange-100 text-orange-800"
      case "suspended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const clientData = {
      company_name: formData.get("company_name") as string,
      contact_person: formData.get("contact_person") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      postal_code: formData.get("postal_code") as string,
      clienttype: formData.get("clienttype") as string,
      status: 'pending',
      rating: 0,
      total_jobs: 0,
      total_revenue: 0,
      average_job_value: 0,
      payment_terms: formData.get("payment_terms") as string,
      credit_limit: Number(formData.get("credit_limit")),
      registration_date: undefined,
      last_job_date: undefined,
      preferred_services: formData.get("preferred_services") ? (formData.get("preferred_services") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      contract_type: 'standard',
      accountmanager: 'Unassigned',
      specialties: formData.get("specialties") ? (formData.get("specialties") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      service_areas: formData.get("service_areas") ? (formData.get("service_areas") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      availability: true,
      client_type: 'external',
      vehicle_types: formData.get("vehicle_types") ? (formData.get("vehicle_types") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    // @ts-expect-error
    const { data, error } = await addExternalClient(clientData);
    if (error) {
      toast.error(`Failed to add client: ${error.message}`);
    } else {
      toast.success(`${clientData.company_name} has been added to the system`);
      await fetchClients();
    }
    setIsAddClientOpen(false);
  };

  const handleAddSubcontractor = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const subData = {
      company_name: formData.get("company_name") as string,
      contact_person: formData.get("contact_person") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      specialties: formData.get("specialties") ? (formData.get("specialties") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      service_areas: formData.get("service_areas") ? (formData.get("service_areas") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      rating: 0,
      completed_jobs: 0,
      response_time: 0,
      hourly_rate: Number(formData.get("hourly_rate")),
      availability: true,
      certifications: formData.get("certifications") ? (formData.get("certifications") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      equipment_types: formData.get("equipment_types") ? (formData.get("equipment_types") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      contract_status: 'active' as 'active',
      last_active: undefined,
      contract_type: 'standard',
      accountmanager: 'Unassigned',
      client_type: 'subcontractor',
    } satisfies Subcontractor;
    const { data, error } = await addSubcontractor(subData);
    if (error) {
      toast.error(`Failed to add subcontractor: ${error.message}`);
    } else {
      toast.success(`${subData.company_name} has been added as a subcontractor`);
      await fetchClients();
    }
    setIsAddSubcontractorOpen(false);
  };

  const handleAddTowingCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const towData = {
      company_name: formData.get("company_name") as string,
      contact_person: formData.get("contact_person") as string,
      phone: formData.get("phone") as string,
      emergency_phone: formData.get("emergency_phone") as string,
      email: formData.get("email") as string,
      service_areas: formData.get("service_areas") ? (formData.get("service_areas") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      vehicle_types: formData.get("vehicle_types") ? (formData.get("vehicle_types") as string).split(',').map(s => s.trim()).filter(Boolean) : [],
      capacity: {
        lightVehicles: Number(formData.get("light_vehicles")) || 0,
        heavyVehicles: Number(formData.get("heavy_vehicles")) || 0,
        specializedEquipment: Number(formData.get("specialized_equipment")) || 0,
      },
      rates: {
        perKm: Number(formData.get("per_km")) || 0,
        baseRate: Number(formData.get("base_rate")) || 0,
        emergencyRate: Number(formData.get("emergency_rate")) || 0,
      },
      rating: 0,
      response_time: 0,
      availability: true,
      status: 'active' as 'active',
      last_used: undefined,
      contract_type: 'standard',
      accountmanager: 'Unassigned',
      client_type: 'towing',
    } satisfies TowingCompany;
    const { data, error } = await addTowingCompany(towData);
    if (error) {
      toast.error(`Failed to add towing company: ${error.message}`);
      console.log("error : " + error.message);
    } else {
      toast.success(`${towData.company_name} has been added as a towing company`);
      await fetchClients();
    }
    setIsAddTowingOpen(false);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      (client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
      (client.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "");
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">External Network</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">External Workshop</TabsTrigger>
            <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>
            <TabsTrigger value="towing">Towing Companies</TabsTrigger>
            <TabsTrigger value="analytics">Network Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Client Database</h3>
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                {/* <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger> */}
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New External Client</DialogTitle>
                    <DialogDescription>Enter client details to add them to the system</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input id="company_name" name="company_name" required />
                      </div>
                      <div>
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input id="contact_person" name="contact_person" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" required />
                      </div>
                      <div>
                        <Label htmlFor="clienttype">Client Type</Label>
                        <Select name="clienttype" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="sme">SME</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment_terms">Payment Terms</Label>
                        <Select name="payment_terms" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="15 days">15 Days</SelectItem>
                            <SelectItem value="30 days">30 Days</SelectItem>
                            <SelectItem value="60 days">60 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" required />
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Input id="province" name="province" required />
                      </div>
                      <div>
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input id="postal_code" name="postal_code" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="credit_limit">Credit Limit (R)</Label>
                      <Input id="credit_limit" name="credit_limit" type="number" required />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Add Client
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <p>Loading clients...</p>
              ) : filteredClients.length === 0 ? (
                <p>No clients found matching your criteria.</p>
              ) : (
                filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{client.company_name}</CardTitle>
                            <p className="text-sm text-gray-600">{client.contact_person}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor((client.status ?? "pending") as string)}>{(client.status ?? "pending").toUpperCase()}</Badge>
                          <Badge variant="outline">{(client.client_type ?? "").toUpperCase()}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{client.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact Information</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {client.city}, {client.province}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Business Metrics</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Total Jobs:</strong> {client.total_jobs ?? 0}
                            </p>
                            <p className="text-sm">
                              <strong>Revenue:</strong> R {(client.total_revenue ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              <strong>Avg Job:</strong> R {(client.average_job_value ?? 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Account Details</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Payment:</strong> {client.payment_terms ?? ""}
                            </p>
                            <p className="text-sm">
                              <strong>Credit Limit:</strong> R {(client.credit_limit ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              <strong>Manager:</strong> {client.accountmanager ?? "Unassigned"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Service History</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Member Since:</strong> {client.registration_date ? new Date(client.registration_date).toLocaleDateString() : "N/A"}
                            </p>
                            {client.last_job_date && (
                              <p className="text-sm">
                                <strong>Last Job:</strong> {client.last_job_date ? new Date(client.last_job_date).toLocaleDateString() : "N/A"}
                              </p>
                            )}
                            <p className="text-sm">
                              <strong>Contract:</strong> {client.contract_type ?? "standard"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {Array.isArray(client.preferred_services) && client.preferred_services.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Preferred Services</h4>
                          <div className="flex flex-wrap gap-1">
                            {client.preferred_services.map((service) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View History
                          </Button>
                        </div>
                        <Button size="sm">Edit Client</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="subcontractors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Subcontractor Network</h3>
              <Dialog open={isAddSubcontractorOpen} onOpenChange={setIsAddSubcontractorOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subcontractor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Subcontractor</DialogTitle>
                    <DialogDescription>Enter subcontractor details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSubcontractor} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input id="company_name" name="company_name" required />
                      </div>
                      <div>
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input id="contact_person" name="contact_person" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" required />
                      </div>
                      <div>
                        <Label htmlFor="hourly_rate">Hourly Rate (R)</Label>
                        <Input id="hourly_rate" name="hourly_rate" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="specialties">Specialties (comma separated)</Label>
                        <Input id="specialties" name="specialties" placeholder="e.g. electrical,mechanical" />
                      </div>
                      <div>
                        <Label htmlFor="service_areas">Service Areas (comma separated)</Label>
                        <Input id="service_areas" name="service_areas" placeholder="e.g. Cape Town,Durban" />
                      </div>
                      <div>
                        <Label htmlFor="certifications">Certifications (comma separated)</Label>
                        <Input id="certifications" name="certifications" placeholder="e.g. ISO,SAQA" />
                      </div>
                      <div>
                        <Label htmlFor="equipment_types">Equipment Types (comma separated)</Label>
                        <Input id="equipment_types" name="equipment_types" placeholder="e.g. crane,flatbed" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit" className="flex-1">Add Subcontractor</Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddSubcontractorOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {loading ? (
                <p>Loading subcontractors...</p>
              ) : subcontractors.length === 0 ? (
                <p>No subcontractors found.</p>
              ) : (
                subcontractors.map((sub) => (
                  <Card key={sub.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{sub.company_name}</CardTitle>
                          <p className="text-sm text-gray-600">{sub.contact_person}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(sub.availability ? 'available' : 'unavailable')}>
                            {(sub.availability ? 'AVAILABLE' : 'UNAVAILABLE')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{sub.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact</h4>
                          <p className="text-sm">{sub.phone}</p>
                          <p className="text-sm">{sub.email}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Performance</h4>
                          <p className="text-sm">
                            <strong>Jobs:</strong> {sub.completed_jobs}
                          </p>
                          <p className="text-sm">
                            <strong>Response:</strong> {sub.response_time}
                          </p>
                          <p className="text-sm">
                            <strong>Rate:</strong> R {sub.hourly_rate}/hr
                          </p>
                        </div>
                      </div>

                      {Array.isArray(sub.specialties) && sub.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sub.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {Array.isArray(sub.service_areas) && sub.service_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sub.service_areas.map((area) => (
                            <Badge key={area} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => { if (typeof sub.id === 'number') { setSelectedSubcontractor(sub); setIsAssignDialogOpen(true); } }}>
                          Assign Job
                        </Button>
                        <Dialog open={isAssignDialogOpen && selectedSubcontractor?.id === sub.id} onOpenChange={setIsAssignDialogOpen}>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Assign Job to {sub.company_name}</DialogTitle>
                              <DialogDescription>Select a job to assign to this subcontractor</DialogDescription>
                            </DialogHeader>
                            <Input
                              placeholder="Search jobs..."
                              value={jobSearchTerm}
                              onChange={(e) => setJobSearchTerm(e.target.value)}
                              className="mb-2"
                            />
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                              {availableJobs.filter(job =>
                                (job.job_id || "").toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                                (job.description || "").toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                                (job.location || "").toLowerCase().includes(jobSearchTerm.toLowerCase())
                              ).map((job) => (
                                <Card key={job.id} className="hover:bg-gray-50">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-semibold">{job.job_id}</h4>
                                        <p className="text-sm text-gray-600">{job.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge>{job.priority}</Badge>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">Location:</span>
                                        <p>{job.location}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Status:</span>
                                        <p>{job.status}</p>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                      <Button variant="outline" size="sm" onClick={() => {
                                        if (typeof sub.id === 'number') assignJobToSubcontractor(job.id, sub.id)
                                      }}>
                                        Assign
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="towing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Towing Company Network</h3>
              <Dialog open={isAddTowingOpen} onOpenChange={setIsAddTowingOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Towing Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Towing Company</DialogTitle>
                    <DialogDescription>Enter towing company details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddTowingCompany} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input id="company_name" name="company_name" required />
                      </div>
                      <div>
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input id="contact_person" name="contact_person" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" required />
                      </div>
                      <div>
                        <Label htmlFor="emergency_phone">Emergency Phone</Label>
                        <Input id="emergency_phone" name="emergency_phone" type="tel" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" required />
                      </div>
                      <div>
                        <Label htmlFor="base_rate">Base Rate (R)</Label>
                        <Input id="base_rate" name="base_rate" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="per_km">Per KM Rate (R)</Label>
                        <Input id="per_km" name="per_km" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="emergency_rate">Emergency Rate (R)</Label>
                        <Input id="emergency_rate" name="emergency_rate" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="light_vehicles">Light Vehicles Capacity</Label>
                        <Input id="light_vehicles" name="light_vehicles" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="heavy_vehicles">Heavy Vehicles Capacity</Label>
                        <Input id="heavy_vehicles" name="heavy_vehicles" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="specialized_equipment">Specialized Equipment Capacity</Label>
                        <Input id="specialized_equipment" name="specialized_equipment" type="number" required />
                      </div>
                      <div>
                        <Label htmlFor="service_areas">Service Areas (comma separated)</Label>
                        <Input id="service_areas" name="service_areas" placeholder="e.g. Cape Town,Durban" />
                      </div>
                      <div>
                        <Label htmlFor="vehicle_types">Vehicle Types (comma separated)</Label>
                        <Input id="vehicle_types" name="vehicle_types" placeholder="e.g. flatbed,crane" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit" className="flex-1">Add Towing Company</Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddTowingOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <p>Loading towing companies...</p>
              ) : towingCompanies.length === 0 ? (
                <p>No towing companies found.</p>
              ) : (
                towingCompanies.map((company) => (
                  <Card key={company.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{company.company_name}</CardTitle>
                          <p className="text-sm text-gray-600">{company.contact_person}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(company.status ? String(company.status) : 'inactive')}>
                            {(company.status ? String(company.status).toUpperCase() : 'INACTIVE')}
                          </Badge>
                          <Badge variant="outline">{(company.availability ? 'AVAILABLE' : 'UNAVAILABLE')}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{company.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact Information</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Phone:</strong> {company.phone}
                            </p>
                            <p className="text-sm">
                              <strong>Emergency:</strong> {company.emergency_phone}
                            </p>
                            <p className="text-sm">
                              <strong>Email:</strong> {company.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Capacity</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Light:</strong> {(company.capacity?.lightVehicles ?? 0)} units
                            </p>
                            <p className="text-sm">
                              <strong>Heavy:</strong> {(company.capacity?.heavyVehicles ?? 0)} units
                            </p>
                            <p className="text-sm">
                              <strong>Special:</strong> {(company.capacity?.specializedEquipment ?? 0)} units
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Rates</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Base:</strong> R {(company.rates?.baseRate ?? 0)}
                            </p>
                            <p className="text-sm">
                              <strong>Per KM:</strong> R {(company.rates?.perKm ?? 0)}
                            </p>
                            <p className="text-sm">
                              <strong>Emergency:</strong> R {(company.rates?.emergencyRate ?? 0)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Performance</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Response:</strong> {company.response_time}
                            </p>
                            <p className="text-sm">
                              <strong>Availability:</strong> {company.availability}
                            </p>
                            {company.last_used && (
                              <p className="text-sm">
                                <strong>Last Used:</strong> {new Date(company.last_used).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {Array.isArray(company.service_areas) && company.service_areas.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Service Areas</h4>
                          <div className="flex flex-wrap gap-1">
                            {company.service_areas.map((area) => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(company.vehicle_types) && company.vehicle_types.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Vehicle Types</h4>
                          <div className="flex flex-wrap gap-1">
                            {company.vehicle_types.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency
                        </Button>
                        <Button size="sm">Request Service</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {clients.filter((c) => c.status === "active").length} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R {clients.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">From external clients</p>
                </CardContent>
              </Card>
              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium"></CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subcontractors.length + towingCompanies.length}</div>
                  <p className="text-xs text-muted-foreground">Subcontractors & towing companies</p>
                </CardContent>
              </Card> */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">16 min</div>
                  <p className="text-xs text-muted-foreground">Network average</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Clients</CardTitle>
                  <CardDescription>Ranked by total revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clients
                      .sort((a, b) => (b.total_revenue ?? 0) - (a.total_revenue ?? 0))
                      .slice(0, 5)
                      .map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">#{index + 1}</span>
                            <div>
                              <p className="font-medium">{client.company_name}</p>
                              <p className="text-sm text-gray-500">{client.total_jobs} jobs</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R {(client.total_revenue ?? 0).toLocaleString()}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{client.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                  <CardDescription>Subcontractor and towing company metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Subcontractor Availability</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Available</span>
                          <span className="text-sm font-medium">
                            {subcontractors.filter((s) => s.availability === true).length}
                            {subcontractors.filter((s) => s.availability === true).length > 0 && <span>Available</span>}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Busy</span>
                          <span className="text-sm font-medium">
                            {subcontractors.filter((s) => s.availability === true).length}
                            {subcontractors.filter((s) => s.availability === true).length > 0 && <span>Available</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Towing Capacity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Light Vehicles</span>
                          <span className="text-sm font-medium">
                            {towingCompanies.reduce((sum, c) => sum + (c.capacity?.lightVehicles ?? 0), 0)} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Heavy Vehicles</span>
                          <span className="text-sm font-medium">
                            {towingCompanies.reduce((sum, c) => sum + (c.capacity?.heavyVehicles ?? 0), 0)} units
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

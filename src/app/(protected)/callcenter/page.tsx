"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Clock, AlertTriangle, Search, Car, User, UserCircle2, Warehouse } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import MapView from "@/components/map/display-map"

interface Breakdown {
  id: string
  order_no: string
  driver_name: string
  driver_phone: string
  registration: string
  location: string
  coordinates: { lat: number; lng: number }
  issue: string
  status: string
  priority: "low" | "medium" | "high" | "emergency"
  created_at: string
  assigned_tech?: string
  estimated_time?: string
  emergency_type?: string
  make: string
  model: string
  breakdown_location: string,
  technician?: Technician;
  workshop?: Workshop;
}

interface Workshop {
  trading_name: string,
  street: string,
  city: string
}

interface Technician {
  id: string
  name: string
  phone: string
  location: string
  availability: string
  specialties: string[]
  type: string
}

interface TechnicianLocation {
  address: string
  lat: number
  lng: number
  name?: string
}


export default function CallCenterPage() {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null)
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()
  useEffect(() => {
    const getBreakdowns = async () => {
      const { data: breakdowns, error } = await supabase
        .from('breakdowns')
        .select(`
            *,
            technician:tech_id (*),
            workshop:workshop_id (*)
          `);

      if (error) {
        console.error('Error fetching breakdowns:', error);
      } else {
        setBreakdowns(breakdowns as unknown as Breakdown[]);
      }
    };

    const getTechnicians = async () => {
      const { data: technicians, error } = await supabase.from('technicians').select('*').neq('isActive', false)
      if (error) {
        console.error(error)
      } else {
        setTechnicians(technicians as unknown as Technician[])
      }
    }
    getTechnicians()
    getBreakdowns()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "dispatched":
        return "bg-blue-100 text-blue-800"
      case "inprogress":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
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

  const getTypeTech = (type: string) => {
    switch (type) {
      case "internal":
        return "bg-green-500 text-white"
      case "external":
        return "bg-blue-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleDispatchTechnician = (breakdownId: string, techId: string) => {
    const tech = technicians.find((t) => t.id === techId)
    if (tech) {
      setBreakdowns((prev) =>
        prev.map((b) =>
          b.id === breakdownId
            ? { ...b, status: "dispatched", assignedTech: tech.name, estimatedTime: "30-60 minutes" }
            : b,
        ),
      )
      setTechnicians((prev) => prev.map((t) => (t.id === techId ? { ...t, available: false } : t)))
      toast.success(`${tech.name} has been assigned to breakdown ${breakdowns.find((b) => b.id === breakdownId)?.order_no}`)
      setIsDispatchDialogOpen(false)
    }
  }

  const filteredBreakdowns = breakdowns.filter(
    (breakdown) =>
      breakdown.order_no ||
      breakdown.driver_name ||
      breakdown.registration,
  )


  const [coords, setCoords] = useState([]) // Array of all coordinates

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('breakdowns')
        .select('*, technicians:tech_id(location)')

      if (error) {
        console.error(error)
        return
      }

      if (data && data.length > 0) {
        const coordsArray = await Promise.all(
          data.map(async (item) => {
            const loc = item.technicians?.location
            if (!loc) {
              return null
            }
            const res = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                loc
              )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
            )
            const geoData = await res.json()
            if (geoData.features && geoData.features.length) {
              return geoData.features[0].center // [lng, lat]
            }
            return null
          })
        )

        // Filter out any nulls in case of failed geocoding
        // @ts-expect-error
        setCoords(coordsArray.filter((c): c is [number, number] => c !== null) as [number, number][])
      }
    }

    fetchLocations()
  }, [])


  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6  h-screen">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Internal & External Technicians</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search breakdowns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Breakdowns</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {filteredBreakdowns.map((breakdown) => (
                <Card
                  key={breakdown.id}
                  className="hover:shadow-lg transition-shadow rounded-lg border"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <CardTitle className="text-lg font-semibold">
                            {breakdown.order_no || `Breakdown #${breakdown.id}`}
                          </CardTitle>
                        </div>
                        <Badge className={getStatusColor(breakdown.status)}>
                          {breakdown.status}
                        </Badge>
                        {breakdown.emergency_type && (
                          <Badge variant="secondary">{breakdown.emergency_type}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {new Date(breakdown.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <h4 className="font-semibold mb-2">Technician Information</h4>
                      <p className="text-sm"><strong>Name:</strong> {breakdown.technician?.name || "no technician assigned"}</p>
                      <p className="text-sm"><strong>Phone:</strong> {breakdown.technician?.phone || "n/a"}</p>
                      <p className="text-sm"><strong>Location:</strong> {breakdown.technician?.location || "n/a"} </p>
                      <div className="flex gap-1 mt-2">
                        {breakdown.technician?.specialties?.map((specialty: string) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>


                      {/* Vehicle Info */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-1">
                          <Car className="h-4 w-4 text-gray-500" />
                          Vehicle Details
                        </h4>
                        <p className="text-sm">
                          <strong>Reg:</strong> {breakdown.registration || "N/A"}
                        </p>
                        <p className="text-sm">
                          <strong>Make:</strong> {breakdown.make || "N/A"}
                        </p>
                        <p className="text-sm">
                          <strong>Model:</strong> {breakdown.model || "N/A"}
                        </p>
                      </div>

                      {/* Location */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-red-500" />
                          Location
                        </h4>
                        <p className="text-sm">
                          {breakdown.technician?.location ||
                            (breakdown.workshop?.street && breakdown.workshop?.city
                              ? `${breakdown.workshop.street}, ${breakdown.workshop.city}`
                              : "n/a")}
                        </p>
                      </div>

                      {/* Issue & Insurance */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-1">
                          <Warehouse className="h-4 w-4 text-gray-500" />
                          Workshop Details
                        </h4>
                        <p className="text-sm">
                          <strong>Trading Name:</strong>{" "}
                          {breakdown.workshop?.trading_name || "No description"}
                        </p>
                        {/* {breakdown.insurance_provider && (
                          <p className="text-sm">
                            <strong>Insurance:</strong> {breakdown.insurance_provider}
                          </p>
                        )}
                        {breakdown.coverage_type && (
                          <Badge variant="outline" className="mt-1">
                            {breakdown.coverage_type}
                          </Badge>
                        )} */}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Technician {breakdown.technician?.phone}
                      </Button>

                      {/* {breakdown.status === "requested" && (
                        <Dialog
                          open={isDispatchDialogOpen}
                          onOpenChange={setIsDispatchDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedBreakdown(breakdown)}
                            >
                              Dispatch Technician
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Dispatch Technician</DialogTitle>
                              <DialogDescription>
                                Select an available technician for breakdown{" "}
                                {selectedBreakdown?.order_no}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {technicians
                                .filter((t) => t.availability)
                                .map((tech) => (
                                  <Card
                                    key={tech.id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() =>
                                      handleDispatchTechnician(
                                        selectedBreakdown?.id || "",
                                        tech.id
                                      )
                                    }
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-semibold">{tech.name} : {tech.type} </h4>
                                          <p className="text-sm text-gray-600">
                                            {tech.phone}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Location: {tech.location}
                                          </p>
                                          <div className="flex gap-1 mt-2">
                                            {tech.specialties.map((specialty) => (
                                              <Badge
                                                key={specialty}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {specialty}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">
                                          Available
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )} */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>


          <TabsContent value="technicians" className="space-y-4">
            <div>
              <div>
                <p className="mb-3 flex flex-row gap-4">Internal Technicians : <UserCircle2 className="bg-green-500 rounded-4xl" color="white" /></p>
                <p className="flex flex-row gap-4">External Technicians : <UserCircle2 className="bg-blue-500 rounded-4xl" color="white" /></p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {technicians.map((tech) => (
                <Card key={tech.id} className={getTypeTech(tech.type)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {tech.name} : <span className="text-sm">{tech.type.toUpperCase()} </span>
                      </CardTitle>
                      <Badge className={tech.availability === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {tech.availability}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">
                      <strong>Phone:</strong> {tech.phone}
                    </p>
                    <p className="text-sm mb-3">
                      <strong>Location:</strong> {tech.location}
                    </p>
                    <div className="space-y-2 flex flex-row gap-4">
                      <h4 className="font-semibold text-sm">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tech.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="m-3">
            <Card className="h-screen">
              <CardHeader>
                <CardTitle>Radius Coverage</CardTitle>
                {/* <CardDescription>Real-time map view of active breakdowns and technician locations</CardDescription> */}
                <CardDescription>Real-time map view of radius coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <MapView />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </>
  )
}

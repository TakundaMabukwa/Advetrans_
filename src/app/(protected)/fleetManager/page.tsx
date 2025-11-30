"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Plus, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Vehicle {
    id: string
    registration: string
    make: string
    model: string
    year: number
    vin: string
    driverId?: string
    status: "active" | "maintenance" | "inactive"
    lastService: string
    nextService: string
}

interface Driver {
    id: string
    name: string
    licenseNumber: string
    phone: string
    email: string
    vehicleId?: string
    status: "active" | "inactive"
    joinDate: string
}

interface JobApproval {
    id: string
    orderNo: string
    driverName: string
    vehicleReg: string
    description: string
    quotationAmount: number
    status: "pending" | "approved" | "rejected"
    submittedAt: string
    costCenter: string
}

export default function FleetManagerPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [jobApprovals, setJobApprovals] = useState<JobApproval[]>([])
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false)
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false)
    const [trip,setTrip] = useState(null)
    const supabase = createClient()

    const fetchTrip = async () => {
        // Simulate fetching trip data from an API
        const {data,error} = await supabase.from('trips').select('*').single()
        if (error) {
            console.error('Error fetching trip:', error)
            return
        }
        setTrip(data as any)
    }

    useEffect(() => {
        fetchTrip()
        // Mock data
        setVehicles([
            {
                id: "1",
                registration: "ABC 123 GP",
                make: "Mercedes-Benz",
                model: "Actros",
                year: 2022,
                vin: "WDB9634321L123456",
                driverId: "1",
                status: "active",
                lastService: "2025-01-01",
                nextService: "2025-04-01",
            },
            {
                id: "2",
                registration: "XYZ 789 GP",
                make: "Volvo",
                model: "FH16",
                year: 2021,
                vin: "YV2A2A1C1DA123456",
                driverId: "2",
                status: "maintenance",
                lastService: "2023-12-15",
                nextService: "2025-03-15",
            },
        ])

        setDrivers([
            {
                id: "1",
                name: "John Smith",
                licenseNumber: "DL123456789",
                phone: "+27 82 123 4567",
                email: "john.smith@company.com",
                vehicleId: "1",
                status: "active",
                joinDate: "2023-06-15",
            },
            {
                id: "2",
                name: "Sarah Johnson",
                licenseNumber: "DL987654321",
                phone: "+27 83 987 6543",
                email: "sarah.johnson@company.com",
                vehicleId: "2",
                status: "active",
                joinDate: "2023-08-20",
            },
        ])

        setJobApprovals([
            {
                id: "1",
                orderNo: "OR.128651312",
                driverName: "John Smith",
                vehicleReg: "ABC 123 GP",
                description: "Engine overheating repair",
                quotationAmount: 2500.0,
                status: "pending",
                submittedAt: "2025-01-15 16:30",
                costCenter: "Maintenance Dept",
            },
        ])
    }, [])

    const handleApproveJob = (jobId: string) => {
        setJobApprovals((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: "approved" } : job)))
        // toast({
        //   title: "Job Approved",
        //   description: "The repair job has been approved and will proceed.",
        // })
    }

    const handleRejectJob = (jobId: string) => {
        setJobApprovals((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: "rejected" } : job)))
        // toast({
        //   title: "Job Rejected",
        //   description: "The repair job has been rejected.",
        //   variant: "destructive",
        // })
    }

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const newVehicle: Vehicle = {
            id: Date.now().toString(),
            registration: formData.get("registration") as string,
            make: formData.get("make") as string,
            model: formData.get("model") as string,
            year: Number.parseInt(formData.get("year") as string),
            vin: formData.get("vin") as string,
            status: "active",
            lastService: formData.get("lastService") as string,
            nextService: formData.get("nextService") as string,
        }
        setVehicles((prev) => [...prev, newVehicle])
        setIsAddVehicleOpen(false)
        // toast({
        //   title: "Vehicle Added",
        //   description: `Vehicle ${newVehicle.registration} has been added to the fleet.`,
        // })
    }

    const handleAddDriver = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const newDriver: Driver = {
            id: Date.now().toString(),
            name: formData.get("name") as string,
            licenseNumber: formData.get("licenseNumber") as string,
            phone: formData.get("phone") as string,
            email: formData.get("email") as string,
            status: "active",
            joinDate: new Date().toISOString().split("T")[0],
        }
        setDrivers((prev) => [...prev, newDriver])
        setIsAddDriverOpen(false)
        // toast({
        //   title: "Driver Added",
        //   description: `Driver ${newDriver.name} has been added to the system.`,
        // })
    }

    return (
        <>
            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Fleet Management</h2>
                </div>

                <Tabs defaultValue="vehicles" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                        <TabsTrigger value="drivers">Drivers</TabsTrigger>
                        <TabsTrigger value="approvals">Job Approvals</TabsTrigger>
                        <TabsTrigger value="customers">Customers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vehicles" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Vehicle Fleet</h3>
                            <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Vehicle
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add New Vehicle</DialogTitle>
                                        <DialogDescription>Enter the vehicle details to add it to the fleet.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddVehicle} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="registration">Registration</Label>
                                                <Input id="registration" name="registration" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="make">Make</Label>
                                                <Input id="make" name="make" required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="model">Model</Label>
                                                <Input id="model" name="model" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="year">Year</Label>
                                                <Input id="year" name="year" type="number" required />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="vin">VIN Number</Label>
                                            <Input id="vin" name="vin" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="lastService">Last Service</Label>
                                                <Input id="lastService" name="lastService" type="date" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="nextService">Next Service</Label>
                                                <Input id="nextService" name="nextService" type="date" required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Add Vehicle
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Registration</TableHead>
                                            <TableHead>Make & Model</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Driver</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Next Service</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vehicles.map((vehicle) => (
                                            <TableRow key={vehicle.id}>
                                                <TableCell className="font-medium">{vehicle.registration}</TableCell>
                                                <TableCell>
                                                    {vehicle.make} {vehicle.model}
                                                </TableCell>
                                                <TableCell>{vehicle.year}</TableCell>
                                                <TableCell>
                                                    {/* Defensive check for drivers array */}
                                                    {vehicle.driverId
                                                      ? (Array.isArray(drivers) && drivers.find((d) => d.id === vehicle.driverId)?.name) || "Unassigned"
                                                      : "Unassigned"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            vehicle.status === "active"
                                                                ? "bg-green-100 text-green-800"
                                                                : vehicle.status === "maintenance"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                        }
                                                    >
                                                        {vehicle.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{vehicle.nextService}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="drivers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Driver Management</h3>
                            <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Driver
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add New Driver</DialogTitle>
                                        <DialogDescription>Enter the driver details to add them to the system.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddDriver} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="licenseNumber">License Number</Label>
                                            <Input id="licenseNumber" name="licenseNumber" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" name="phone" type="tel" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" name="email" type="email" required />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Add Driver
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>License Number</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Vehicle</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {drivers.map((driver) => (
                                            <TableRow key={driver.id}>
                                                <TableCell className="font-medium">{driver.name}</TableCell>
                                                <TableCell>{driver.licenseNumber}</TableCell>
                                                <TableCell>{driver.phone}</TableCell>
                                                <TableCell>{driver.email}</TableCell>
                                                <TableCell>
                                                    {/* Defensive check for vehicles array */}
                                                    {driver.vehicleId
                                                      ? (Array.isArray(vehicles) && vehicles.find((v) => v.id === driver.vehicleId)?.registration) || "Unassigned"
                                                      : "Unassigned"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            driver.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }
                                                    >
                                                        {driver.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="approvals" className="space-y-4">
                        <h3 className="text-lg font-semibold">Job Approvals</h3>
                        <div className="grid gap-4">
                            {jobApprovals.map((job) => (
                                <Card key={job.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{job.orderNo}</CardTitle>
                                                <CardDescription>
                                                    Submitted by {job.costCenter} on {job.submittedAt}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                className={
                                                    job.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : job.status === "approved"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                }
                                            >
                                                {job.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm">
                                                    <strong>Driver:</strong> {job.driverName}
                                                </p>
                                                <p className="text-sm">
                                                    <strong>Vehicle:</strong> {job.vehicleReg}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm">
                                                    <strong>Description:</strong>
                                                </p>
                                                <p className="text-sm text-gray-600">{job.description}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm">
                                                    <strong>Quotation Amount:</strong>
                                                </p>
                                                <p className="text-lg font-semibold text-green-600">R {job.quotationAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        {job.status === "pending" && (
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleApproveJob(job.id)} className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button variant="destructive" onClick={() => handleRejectJob(job.id)}>
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="customers" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Customer Management</h3>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-center text-gray-500">Customer management interface will be implemented here</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
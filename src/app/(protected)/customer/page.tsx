"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Phone } from "lucide-react"

interface CustomerBreakdown {
  id: string
  orderNo: string
  vehicleReg: string
  location: string
  description: string
  status: "breakdown-reported" | "dispatched" | "job-complete" | "cancelled"
  estimatedTime?: string
  technicianName?: string
  technicianPhone?: string
  quotationAmount?: number
  quotationStatus?: "pending" | "approved" | "rejected"
  createdAt: string
  completedAt?: string
}

export default function CustomerPage() {
  const [breakdowns, setBreakdowns] = useState<CustomerBreakdown[]>([])
  const [isRequestBreakdownOpen, setIsRequestBreakdownOpen] = useState(false)

  useEffect(() => {
    // Mock data for customer breakdowns
    setBreakdowns([
      {
        id: "1",
        orderNo: "OR.128651312",
        vehicleReg: "ABC 123 GP",
        location: "N1 Highway, Johannesburg",
        description: "Engine overheating, steam coming from radiator",
        status: "dispatched",
        estimatedTime: "45 minutes",
        technicianName: "Mike Wilson",
        technicianPhone: "+27 84 111 2222",
        quotationAmount: 2500.0,
        quotationStatus: "pending",
        createdAt: "2025-01-15 14:30",
      },
      {
        id: "2",
        orderNo: "OR.128651310",
        vehicleReg: "XYZ 789 GP",
        location: "M1 Highway, Sandton",
        description: "Flat tire replacement",
        status: "job-complete",
        technicianName: "David Brown",
        quotationAmount: 800.0,
        quotationStatus: "approved",
        createdAt: "2025-01-14 10:30",
        completedAt: "2025-01-14 12:15",
      },
    ])
  }, [])

  const handleRequestBreakdown = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const newBreakdown: CustomerBreakdown = {
      id: Date.now().toString(),
      orderNo: `OR.${Date.now()}`,
      vehicleReg: formData.get("vehicleReg") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      status: "breakdown-reported",
      createdAt: new Date().toLocaleString(),
    }

    setBreakdowns((prev) => [...prev, newBreakdown])
    setIsRequestBreakdownOpen(false)
    // toast({
    //   title: "Breakdown Reported",
    //   description: `Your breakdown request ${newBreakdown.orderNo} has been submitted. Help is on the way!`,
    // })
  }

  const handleApproveQuotation = (breakdownId: string) => {
    setBreakdowns((prev) => prev.map((b) => (b.id === breakdownId ? { ...b, quotationStatus: "approved" } : b)))
            // toast({
            //   title: "Quotation Approved",
            //   description: "The repair work will proceed as quoted.",
            // })
  }

  const handleRejectQuotation = (breakdownId: string) => {
    setBreakdowns((prev) => prev.map((b) => (b.id === breakdownId ? { ...b, quotationStatus: "rejected" } : b)))
    // toast({
    //   title: "Quotation Rejected",
    //   description: "The quotation has been rejected. Alternative options will be provided.",
    //   variant: "destructive",
    // })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "breakdown-reported":
        return "bg-red-100 text-red-800"
      case "dispatched":
        return "bg-blue-100 text-blue-800"
      case "job-complete":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "breakdown-reported":
        return <AlertTriangle className="h-4 w-4" />
      case "dispatched":
        return <Clock className="h-4 w-4" />
      case "job-complete":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <>
        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">My Breakdowns</h2>
            <Dialog open={isRequestBreakdownOpen} onOpenChange={setIsRequestBreakdownOpen}>
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Breakdown Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Breakdown Service</DialogTitle>
                  <DialogDescription>Please provide details about your breakdown situation.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestBreakdown} className="space-y-4">
                  <div>
                    <Label htmlFor="vehicleReg">Vehicle Registration</Label>
                    <Input id="vehicleReg" name="vehicleReg" placeholder="ABC 123 GP" required />
                  </div>
                  <div>
                    <Label htmlFor="location">Current Location</Label>
                    <Input id="location" name="location" placeholder="N1 Highway, Johannesburg" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Problem Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the issue with your vehicle..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Breakdown Request
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Requests</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="quotations">Pending Quotations</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <div className="grid gap-4">
                {breakdowns
                  .filter((b) => b.status !== "job-complete")
                  .map((breakdown) => (
                    <Card key={breakdown.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(breakdown.status)}
                              <CardTitle className="text-lg">{breakdown.orderNo}</CardTitle>
                            </div>
                            <Badge className={getStatusColor(breakdown.status)}>
                              {breakdown.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{breakdown.createdAt}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Vehicle & Location</h4>
                            <p className="text-sm">
                              <strong>Vehicle:</strong> {breakdown.vehicleReg}
                            </p>
                            <div className="flex items-start gap-2 mt-1">
                              <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                              <p className="text-sm">{breakdown.location}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Issue Description</h4>
                            <p className="text-sm text-gray-600">{breakdown.description}</p>
                          </div>
                        </div>

                        {breakdown.status === "dispatched" && breakdown.technicianName && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Technician Assigned</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <p className="text-sm">
                                <strong>Name:</strong> {breakdown.technicianName}
                              </p>
                              <p className="text-sm">
                                <strong>Phone:</strong> {breakdown.technicianPhone}
                              </p>
                              {breakdown.estimatedTime && (
                                <p className="text-sm">
                                  <strong>ETA:</strong> {breakdown.estimatedTime}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Technician
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="grid gap-4">
                {breakdowns
                  .filter((b) => b.status === "job-complete")
                  .map((breakdown) => (
                    <Card key={breakdown.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-lg">{breakdown.orderNo}</CardTitle>
                            <Badge className="bg-green-100 text-green-800">COMPLETED</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Requested: {breakdown.createdAt}</p>
                            <p className="text-sm text-gray-500">Completed: {breakdown.completedAt}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm">
                              <strong>Vehicle:</strong> {breakdown.vehicleReg}
                            </p>
                            <p className="text-sm">
                              <strong>Location:</strong> {breakdown.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <strong>Issue:</strong>
                            </p>
                            <p className="text-sm text-gray-600">{breakdown.description}</p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <strong>Technician:</strong> {breakdown.technicianName}
                            </p>
                            {breakdown.quotationAmount && (
                              <p className="text-sm">
                                <strong>Total Cost:</strong> R {breakdown.quotationAmount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="quotations" className="space-y-4">
              <div className="grid gap-4">
                {breakdowns
                  .filter((b) => b.quotationAmount && b.quotationStatus === "pending")
                  .map((breakdown) => (
                    <Card key={breakdown.id} className="border-orange-200">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{breakdown.orderNo}</CardTitle>
                            <CardDescription>Quotation requires your approval</CardDescription>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">PENDING APPROVAL</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm">
                              <strong>Vehicle:</strong> {breakdown.vehicleReg}
                            </p>
                            <p className="text-sm">
                              <strong>Work Description:</strong>
                            </p>
                            <p className="text-sm text-gray-600">{breakdown.description}</p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <strong>Technician:</strong> {breakdown.technicianName}
                            </p>
                            <p className="text-lg font-semibold text-green-600 mt-2">
                              Quoted Amount: R {breakdown.quotationAmount?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveQuotation(breakdown.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Quotation
                          </Button>
                          <Button variant="destructive" onClick={() => handleRejectQuotation(breakdown.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Quotation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </>
  )
}

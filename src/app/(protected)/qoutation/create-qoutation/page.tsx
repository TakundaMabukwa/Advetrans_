"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DollarSign,
    Plus,
    Trash2,
    FileText,
    Camera,
    MessageSquare,
    User,
    Wrench,
    Clock,
    CheckCircle,
    AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

interface TechnicianReport {
    id: string
    orderNo: string
    technicianName: string
    technicianId: string
    driverName: string
    vehicleReg: string
    location: string
    reportDate: string
    diagnosis: string
    recommendedActions: string[]
    urgencyLevel: "low" | "medium" | "high" | "critical"
    estimatedTime: string
    photosCount: number
    status: "pending-quotation" | "quotation-created" | "approved" | "rejected"
    fleetManagerNotes?: string
    customerApproval?: "pending" | "approved" | "rejected"
}

interface QuotationItem {
    id: string
    category: "labor" | "parts" | "materials" | "other"
    description: string
    quantity: number
    unitPrice: number
    total: number
    supplier?: string
    partNumber?: string
    warrantyPeriod?: string
}

interface FleetManagerRequirement {
    id: string
    orderNo: string
    requirement: string
    priority: "low" | "medium" | "high"
    deadline?: string
    notes: string
    status: "open" | "addressed" | "closed"
}

export default function CreateQuotationPage() {
    const [technicianReports, setTechnicianReports] = useState<TechnicianReport[]>([])
    const [fleetRequirements, setFleetRequirements] = useState<FleetManagerRequirement[]>([])
    const [selectedReport, setSelectedReport] = useState<TechnicianReport | null>(null)
    const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([])
    const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false)
    const [quotationNotes, setQuotationNotes] = useState("")

    useEffect(() => {
        // Mock data for technician reports
        setTechnicianReports([
            {
                id: "1",
                orderNo: "OR.128651312",
                technicianName: "Mike Wilson",
                technicianId: "TECH001",
                driverName: "John Smith",
                vehicleReg: "ABC 123 GP",
                location: "N1 Highway, Johannesburg",
                reportDate: "2025-01-15 16:30",
                diagnosis:
                    "Engine overheating due to faulty radiator. Coolant leak detected at lower radiator hose connection. Thermostat appears to be functioning correctly. Water pump shows signs of wear but still operational.",
                recommendedActions: [
                    "Replace radiator assembly",
                    "Replace lower radiator hose",
                    "Flush cooling system",
                    "Replace coolant",
                    "Pressure test cooling system",
                    "Check water pump for future replacement",
                ],
                urgencyLevel: "high",
                estimatedTime: "4-6 hours",
                photosCount: 8,
                status: "pending-quotation",
                fleetManagerNotes: "Approve repair but use OEM parts only. Vehicle is critical for operations.",
            },
            {
                id: "2",
                orderNo: "OR.128651313",
                technicianName: "David Brown",
                technicianId: "TECH002",
                driverName: "Sarah Johnson",
                vehicleReg: "XYZ 789 GP",
                location: "M1 Highway, Sandton",
                reportDate: "2025-01-15 14:15",
                diagnosis:
                    "Multiple tire punctures on rear axle. Tires are beyond repair. Brake pads showing 20% wear remaining. Brake discs have minor scoring but within acceptable limits.",
                recommendedActions: [
                    "Replace both rear tires",
                    "Wheel alignment check",
                    "Brake system inspection",
                    "Replace brake pads (preventive)",
                ],
                urgencyLevel: "medium",
                estimatedTime: "2-3 hours",
                photosCount: 5,
                status: "pending-quotation",
                fleetManagerNotes: "Use budget-friendly tire options. Brake work can be deferred to next service.",
            },
        ])

        setFleetRequirements([
            {
                id: "1",
                orderNo: "OR.128651312",
                requirement: "Use only OEM radiator parts for this critical vehicle",
                priority: "high",
                deadline: "2025-01-16",
                notes: "This vehicle is essential for daily operations. Quality over cost.",
                status: "open",
            },
            {
                id: "2",
                orderNo: "OR.128651312",
                requirement: "Provide 6-month warranty on cooling system work",
                priority: "medium",
                notes: "Standard warranty terms apply",
                status: "open",
            },
            {
                id: "3",
                orderNo: "OR.128651313",
                requirement: "Use budget-friendly tire options",
                priority: "medium",
                notes: "Cost optimization required for this vehicle",
                status: "open",
            },
        ])
    }, [])

    const handleCreateQuotation = (report: TechnicianReport) => {
        setSelectedReport(report)

        // Pre-populate quotation items based on technician recommendations
        const prePopulatedItems: QuotationItem[] = []

        if (report.orderNo === "OR.128651312") {
            prePopulatedItems.push(
                {
                    id: "1",
                    category: "parts",
                    description: "OEM Radiator Assembly",
                    quantity: 1,
                    unitPrice: 1200.0,
                    total: 1200.0,
                    supplier: "Mercedes Parts SA",
                    partNumber: "RAD-MB-001",
                    warrantyPeriod: "12 months",
                },
                {
                    id: "2",
                    category: "parts",
                    description: "Lower Radiator Hose",
                    quantity: 1,
                    unitPrice: 150.0,
                    total: 150.0,
                    supplier: "Mercedes Parts SA",
                    partNumber: "HOSE-LR-002",
                },
                {
                    id: "3",
                    category: "materials",
                    description: "Engine Coolant (5L)",
                    quantity: 2,
                    unitPrice: 85.0,
                    total: 170.0,
                    supplier: "Automotive Supplies",
                },
                {
                    id: "4",
                    category: "labor",
                    description: "Radiator Replacement & System Flush",
                    quantity: 5,
                    unitPrice: 180.0,
                    total: 900.0,
                },
            )
        }

        setQuotationItems(prePopulatedItems)
        setIsCreateQuotationOpen(true)
    }

    const addQuotationItem = () => {
        const newItem: QuotationItem = {
            id: Date.now().toString(),
            category: "parts",
            description: "",
            quantity: 1,
            unitPrice: 0,
            total: 0,
        }
        setQuotationItems((prev) => [...prev, newItem])
    }

    const updateQuotationItem = (id: string, field: keyof QuotationItem, value: any) => {
        setQuotationItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value }
                    if (field === "quantity" || field === "unitPrice") {
                        updated.total = updated.quantity * updated.unitPrice
                    }
                    return updated
                }
                return item
            }),
        )
    }

    const removeQuotationItem = (id: string) => {
        setQuotationItems((prev) => prev.filter((item) => item.id !== id))
    }

    const getTotalAmount = () => {
        return quotationItems.reduce((sum, item) => sum + item.total, 0)
    }

    const handleSubmitQuotation = () => {
        if (!selectedReport) return

        // Update report status
        setTechnicianReports((prev) =>
            prev.map((report) => (report.id === selectedReport.id ? { ...report, status: "quotation-created" } : report)),
        )

        toast.success(`Quotation for ${selectedReport.orderNo} has been sent to fleet manager for approval.`)

        setIsCreateQuotationOpen(false)
        setSelectedReport(null)
        setQuotationItems([])
        setQuotationNotes("")
    }

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "critical":
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending-quotation":
                return "bg-yellow-100 text-yellow-800"
            case "quotation-created":
                return "bg-blue-100 text-blue-800"
            case "approved":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800"
            case "medium":
                return "bg-yellow-100 text-yellow-800"
            case "low":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <>


            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Technician Reports & Fleet Requirements</h2>
                </div>

                <Tabs defaultValue="reports" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="reports">Technician Reports</TabsTrigger>
                        <TabsTrigger value="requirements">Fleet Manager Requirements</TabsTrigger>
                        <TabsTrigger value="active">Active Quotations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="reports" className="space-y-4">
                        <div className="grid gap-4">
                            {technicianReports.map((report) => (
                                <Card key={report.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="h-5 w-5 text-blue-500" />
                                                    <CardTitle className="text-lg">{report.orderNo}</CardTitle>
                                                </div>
                                                <Badge className={getUrgencyColor(report.urgencyLevel)}>
                                                    {report.urgencyLevel.toUpperCase()}
                                                </Badge>
                                                <Badge className={getStatusColor(report.status)}>
                                                    {report.status.replace("-", " ").toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{report.reportDate}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Vehicle & Technician Info */}
                                            <div>
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Job Information
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <p>
                                                        <strong>Technician:</strong> {report.technicianName}
                                                    </p>
                                                    <p>
                                                        <strong>Driver:</strong> {report.driverName}
                                                    </p>
                                                    <p>
                                                        <strong>Vehicle:</strong> {report.vehicleReg}
                                                    </p>
                                                    <p>
                                                        <strong>Location:</strong> {report.location}
                                                    </p>
                                                    <p>
                                                        <strong>Est. Time:</strong> {report.estimatedTime}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Camera className="h-4 w-4" />
                                                        <span>{report.photosCount} photos attached</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Diagnosis */}
                                            <div>
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Diagnosis
                                                </h4>
                                                <p className="text-sm text-gray-700 mb-3">{report.diagnosis}</p>

                                                <h5 className="font-medium mb-2">Recommended Actions:</h5>
                                                <ul className="text-sm space-y-1">
                                                    {report.recommendedActions.map((action, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Fleet Manager Notes */}
                                            <div>
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Fleet Manager Notes
                                                </h4>
                                                {report.fleetManagerNotes ? (
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-sm text-blue-800">{report.fleetManagerNotes}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No specific requirements noted</p>
                                                )}

                                                {/* Related Requirements */}
                                                <div className="mt-4">
                                                    <h5 className="font-medium mb-2">Related Requirements:</h5>
                                                    {fleetRequirements
                                                        .filter((req) => req.orderNo === report.orderNo)
                                                        .map((req) => (
                                                            <div key={req.id} className="text-xs p-2 bg-gray-50 rounded mb-2">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge className={getPriorityColor(req.priority)}>
                                                                        {req.priority}
                                                                    </Badge>
                                                                    {req.deadline && <span className="text-gray-500">Due: {req.deadline}</span>}
                                                                </div>
                                                                <p>{req.requirement}</p>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                            <Button variant="outline" size="sm">
                                                <Camera className="h-4 w-4 mr-2" />
                                                View Photos
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Contact Technician
                                            </Button>
                                            {report.status === "pending-quotation" && (
                                                <Button onClick={() => handleCreateQuotation(report)}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Create Quotation
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="requirements" className="space-y-4">
                        <div className="grid gap-4">
                            {fleetRequirements.map((requirement) => (
                                <Card key={requirement.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-lg">{requirement.orderNo}</CardTitle>
                                                <Badge className={getPriorityColor(requirement.priority)}>
                                                    {requirement.priority.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline">{requirement.status.replace("-", " ").toUpperCase()}</Badge>
                                            </div>
                                            {requirement.deadline && (
                                                <div className="text-sm text-gray-500">Deadline: {requirement.deadline}</div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm mb-2">
                                            <strong>Requirement:</strong> {requirement.requirement}
                                        </p>
                                        {requirement.notes && (
                                            <p className="text-sm text-gray-600">
                                                <strong>Notes:</strong> {requirement.notes}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4">
                        <div className="grid gap-4">
                            {technicianReports
                                .filter((report) => report.status === "quotation-created")
                                .map((report) => (
                                    <Card key={report.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{report.orderNo}</CardTitle>
                                                    <CardDescription>Quotation sent to fleet manager</CardDescription>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-800">PENDING APPROVAL</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">
                                                <strong>Vehicle:</strong> {report.vehicleReg} |<strong> Technician:</strong>{" "}
                                                {report.technicianName}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Create Quotation Dialog */}
                <Dialog open={isCreateQuotationOpen} onOpenChange={setIsCreateQuotationOpen}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Quotation - {selectedReport?.orderNo}</DialogTitle>
                            <DialogDescription>
                                Based on technician report from {selectedReport?.technicianName} and fleet manager requirements
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Job Summary */}
                            {selectedReport && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Job Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p>
                                                    <strong>Vehicle:</strong> {selectedReport.vehicleReg}
                                                </p>
                                                <p>
                                                    <strong>Driver:</strong> {selectedReport.driverName}
                                                </p>
                                                <p>
                                                    <strong>Technician:</strong> {selectedReport.technicianName}
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    <strong>Location:</strong> {selectedReport.location}
                                                </p>
                                                <p>
                                                    <strong>Urgency:</strong> {selectedReport.urgencyLevel}
                                                </p>
                                                <p>
                                                    <strong>Est. Time:</strong> {selectedReport.estimatedTime}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quotation Items */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">Quotation Items</CardTitle>
                                        <Button onClick={addQuotationItem} variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Unit Price</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {quotationItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Select
                                                            value={item.category}
                                                            onValueChange={(value) => updateQuotationItem(item.id, "category", value)}
                                                        >
                                                            <SelectTrigger className="w-24">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="labor">Labor</SelectItem>
                                                                <SelectItem value="parts">Parts</SelectItem>
                                                                <SelectItem value="materials">Materials</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => updateQuotationItem(item.id, "description", e.target.value)}
                                                            placeholder="Item description"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateQuotationItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)
                                                            }
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) =>
                                                                updateQuotationItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                                                            }
                                                            className="w-24"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold">R {item.total.toFixed(2)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm" onClick={() => removeQuotationItem(item.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <div className="flex justify-end mt-4">
                                        <div className="text-right">
                                            <p className="text-lg font-semibold">Total Amount: R {getTotalAmount().toFixed(2)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quotation Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={quotationNotes}
                                        onChange={(e) => setQuotationNotes(e.target.value)}
                                        placeholder="Add any additional notes, warranty information, or special conditions..."
                                        rows={4}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateQuotationOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitQuotation}>Submit Quotation</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}
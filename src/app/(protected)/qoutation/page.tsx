"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Driver {
    first_name: string | null;
    surname: string | null;
    cell_number: string | null;
}

interface Vehicle {
    registration_number: string | null;
    make: string | null;
    model: string | null;
}

interface Job {
    id: number;
    job_id: string;
    title: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high" | "emergency";
    created_at: string;
    updated_at: string;
    drivers?: Driver;
    vehiclesc?: Vehicle;
    location: string;
    coordinates: { lat: number; lng: number };
    technician_id: number | null;
    technicians?: Technician;
    estimatedCost?: number;
    actualCost?: number;
    clientType: "internal" | "external";
    clientName?: string;
    approvalRequired: boolean;
    approvedBy?: string;
    approvedAt?: string;
    notes: string;
    attachments: string[];
    completed_at: string;
    eta: string;
}

interface Technician {
    id: number,
    name: string;
    surname: string;
    phone: string;
    location: string;
    rating: string;
    specialties: string[],
}

interface Quotation {
    id: string
    breakdown_id?: string
    cost_center_id?: string
    estimate_amount?: number
    status: "pending" | "approved" | "rejected" | "paid" | "pending-inspection" | "pending-approval"
    reason?: string
    created_at: string
    job_type?: string
    issue?: string
    parts_needed?: string[]
    estimated_cost?: number
    priority?: string
    estimated_time?: string
    additional_notes?: string
    job_id?: Job;
    paid?: boolean
    orderno?: string
    drivername?: string
    vehiclereg?: string
    description?: string
    laborcost?: number
    partscost?: number
    totalcost?: number
    created_by?: string
    jobcard_id?: number
    type: string
    markupPrice: number
}
// statuses pending aprrove paid


export default function CostCenterPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    // const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false)
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchQuotations = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("quotations")
                .select(`
            *,
            job_id (
              *,
              drivers (
                first_name,
                surname,
                cell_number
              ),
              vehiclesc (
                registration_number,
                make,
                model
              ),
              technicians(*)
            )
          `)
                .order("created_at", { ascending: false })
                .not("markupPrice", "is", null);

            if (error) {
                console.error("Error fetching quotations:", error)
                toast.error("Failed to fetch quotations")
                return
            }

            setQuotations((data as []) as Quotation[])
        } catch (error) {
            console.error("Error:", error)
            toast.error("Failed to fetch quotations")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuotations()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "approved":
                return "bg-green-100 text-green-800"
            case "pending-inspection":
                return "bg-orange-100 text-green-800"
            case "paid":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const onSubmit = () => {
        console.log("Wow")
    }


    return (
        <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Qoutes Management</h2>
                {/* <Dialog open={isCreateQuotationOpen} onOpenChange={setIsCreateQuotationOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Create Quotation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Qoutes Type</DialogTitle>
                            <DialogDescription>Create a detailed quotation for Qoutes work.</DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog> */}
            </div>

            <Tabs defaultValue="quotations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="quotations">All Qoutes</TabsTrigger>
                    <TabsTrigger value="pending-approval">Pending Approval</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                </TabsList>

                {/* add filter for type of Qoutes statues */}
                {/* if older than five day we remove and we have were we can get all */}

                {['quotations', 'approved', 'pending', 'pending-inspection', "pending-approval"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4">
                        <div className="grid gap-4">
                            {loading ? (
                                <div className="text-center py-8">Loading quotations...</div>
                            ) : quotations.filter(q => tab === 'quotations' || q.status === tab).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No quotations found</div>
                            ) : (
                                quotations
                                    .filter(q => tab === 'quotations' || q.status === tab)
                                    .map((quotation) => (
                                        <Card key={quotation.id}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-md">
                                                            {quotation.orderno || `Quotation ${quotation.id.slice(0, 8)}`} : {quotation.job_id?.vehiclesc?.registration_number ?? 'N/A'}
                                                        </CardTitle>
                                                        <CardDescription>Created on {new Date(quotation.created_at).toLocaleString()}</CardDescription>
                                                    </div>
                                                    <div className="flex flex-row">
                                                        <p className="text-sm">{quotation.type.toUpperCase()} QUOTE :</p>
                                                        <Badge className={getStatusColor(quotation.status)}>
                                                            {quotation.status.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm font-medium">Technician: {quotation.job_id?.technicians?.name}</p>
                                                        <p className="text-sm font-medium">Driver: {quotation.job_id?.drivers ? `${quotation.job_id.drivers.first_name} ${quotation.job_id.drivers.surname ?? ''}` : 'N/A'}</p>
                                                        <p className="text-sm font-medium">Vehicle: {quotation.job_id?.vehiclesc?.registration_number ?? 'N/A'}</p>
                                                        <p className="text-sm font-medium">Job Type: {quotation.job_type || 'N/A'}</p>
                                                        <p className="text-sm font-medium">Priority: {quotation.priority || 'N/A'}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium">Description:</p>
                                                        <p className="text-sm text-gray-600">{quotation.issue || 'N/A'}</p>
                                                        {quotation.issue && (
                                                            <>
                                                                <p className="text-sm font-medium mt-2">Notes:</p>
                                                                <p className="text-sm text-gray-600">{quotation.additional_notes}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Labor: R {(quotation.laborcost || 0).toFixed(2)}</p>
                                                        <p className="text-sm font-medium">Parts: R {(quotation.partscost || 0).toFixed(2)}</p>
                                                        <p className="text-lg font-semibold text-green-600">Total: R {(quotation.totalcost || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                {quotation.parts_needed && quotation.parts_needed.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-sm font-semibold mb-2">Parts Needed:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {quotation.parts_needed.map((part, index) => {
                                                                let partName = part;
                                                                try {
                                                                    const parsed = JSON.parse(part);
                                                                    if (parsed && parsed.name) partName = parsed.name;
                                                                } catch {
                                                                    { part }
                                                                }
                                                                return <Badge key={index} variant="outline">{partName}</Badge>;
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <Link href={`/qoutation/${quotation.id}`}>
                                                        <Button variant="outline">View Details</Button>
                                                    </Link>

                                                    {/* <Dialog open={open}
                                                        onOpenChange={(isOpen) => {
                                                            if (!isOpen) setSelectedQuotation(null)
                                                            setOpen(isOpen)
                                                        }}
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button>Inspection</Button>
                                                        </DialogTrigger>

                                                        <DialogContent className="sm:max-w-lg">
                                                            <DialogHeader>
                                                                <DialogTitle>Book inspection</DialogTitle>
                                                                <DialogDescription>Provide key details so we can schedule quickly.</DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={onSubmit} className="space-y-4">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="when">Preferred date & time</Label>
                                                                        <Input id="when" name="when" type="datetime-local" required />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="contact">Contact (phone or email)</Label>
                                                                        <Input
                                                                            id="contact"
                                                                            name="contact"
                                                                            placeholder="+27 82 123 4567 or name@email"
                                                                            required
                                                                            defaultValue={selectedQuotation?.drivername || ""}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <DialogFooter className="gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => setOpen(false)}
                                                                        disabled={submitting}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button type="submit" disabled={submitting}>
                                                                        {submitting ? "Booking…" : "Book inspection"}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog> */}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
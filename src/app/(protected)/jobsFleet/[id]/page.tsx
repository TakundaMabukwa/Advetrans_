"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
    FileText,
    Clock,
    MapPin,
    User,
    Truck,
    DollarSign,
    CheckCircle,
    XCircle,
    ArrowLeft,
    MessageSquare,
    FileImage,
    Phone,
    Calendar,
    AlertTriangle,
    Download,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Job {
    id: number;
    job_id: string;
    title: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high" | "emergency";
    created_at: string;
    updated_at: string;
    drivers: {
        length: number
        first_name: string | null;
        surname: string | null;
        cell_number: string | null;
        job_allocated: boolean;
    } | null;   // Note: single object or null

    vehiclesc: {
        length: number
        registration_number: string | null;
        make: string | null;
        model: string | null;
    } | null;   // single object or null

    location: string;
    coordinates: { lat: number; lng: number };
    technician_id: number | null;
    technicians: {
        name: string;
        phone: string;
    } | null;
    assignedTechnician?: string
    technicianPhone?: string
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

export default function FleetJobDetailPage() {
    const params = useParams()
    const [job, setJob] = useState<Job | null>(null)
    const [userRole, setUserRole] = useState<string>("")
    const [newNote, setNewNote] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "call-center"
        setUserRole(role)

        const fetchJob = async () => {
            try {
                const { data: jobData, error } = await supabase
                    .from('job_assignments')
                    .select('*, drivers(*), vehiclesc(*), technicians(*)')
                    .eq('id', Number(params.id))
                    .single()

                if (error) {
                    console.error('Error fetching job:', error)
                    setIsLoading(false)
                    return
                }

                if (jobData) {
                    setJob(jobData as unknown as Job)
                }
                setIsLoading(false)
            } catch (error) {
                console.error('Error fetching job:', error)
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchJob()
        }
    }, [params.id])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "assigned":
                return "bg-blue-100 text-blue-800"
            case "inprogress":
                return "bg-orange-100 text-orange-800"
            case "awaiting-approval":
                return "bg-purple-100 text-purple-800"
            case "approved":
                return "bg-green-100 text-green-800"
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

    const handleAddNote = async () => {
        if (!newNote.trim() || !job) return

        try {
            const { error } = await supabase
                .from('job_assignments')
                .update({
                    notes: newNote,
                    updated_at: new Date().toISOString()
                })
                .eq('id', job.id)

            if (error) {
                console.error('Error adding note:', error)
                return
            }

            // Update local state
            setJob({
                ...job,
                notes: newNote,
                updated_at: new Date().toISOString(),
            })
            setNewNote("")
        } catch (error) {
            console.error('Error adding note:', error)
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        if (!job) return

        try {
            const { error } = await supabase
                .from('job_assignments')
                .update({
                    updated_at: new Date().toISOString()
                })
                .eq('id', job.id)

            if (error) {
                console.error('Error updating job status:', error)
                return
            }

            // Update local state
            setJob({
                ...job,
                status: newStatus as Job["status"],
                updated_at: new Date().toISOString(),
            })
        } catch (error) {
            console.error('Error updating job status:', error)
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!job) {
        return <div>Job not found</div>
    }

    const canApproveJobs = userRole === "fleet manager"
    const canUpdateStatus = userRole === "call center" || userRole === "fleet manager"

    return (
        <>

            <Link href="/jobsFleet">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Jobs
                </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold">{job.job_id}</h1>
            </div>


            <div className="flex-1 space-y-6 p-6">
                {/* Job Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{job.title}</h2>
                            <p className="text-muted-foreground mt-1">{job.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                            {job.clientType === "external" && <Badge variant="outline">External Client</Badge>}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {job.status === "awaiting-approval" && canApproveJobs && (
                        <div className="flex gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-yellow-800">Approval Required</h4>
                                <p className="text-sm text-yellow-700">This job requires fleet manager approval to proceed.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleStatusUpdate("approved")}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                                <Button variant="destructive" onClick={() => handleStatusUpdate("cancelled")} size="sm">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">Job Details</TabsTrigger>
                        {/* <TabsTrigger value="timeline">Timeline</TabsTrigger> */}
                        <TabsTrigger value="notes">Notes & Communication</TabsTrigger>
                        <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Driver Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Driver Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium">Name</Label>
                                        <p className="text-sm">{job.drivers?.first_name} {job.drivers?.surname}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <p className="text-sm">{job.drivers?.cell_number}</p>

                                        </div>
                                    </div>
                                    {job.clientName && (
                                        <div>
                                            <Label className="text-sm font-medium">Client</Label>
                                            <p className="text-sm">{job.clientName}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Vehicle Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Vehicle Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium">Registration</Label>
                                        <p className="text-sm font-mono">{job.vehiclesc?.registration_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Make & Model</Label>
                                        <p className="text-sm">
                                            {job.vehiclesc?.make} {job.vehiclesc?.model}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Location & Technician
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium">Location</Label>
                                        <p className="text-sm">{job.location}</p>
                                    </div>
                                    {job.technicians && (
                                        <>
                                            <div>
                                                <Label className="text-sm font-medium">Assigned Technician</Label>
                                                <p className="text-sm">{job.technicians.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Technician Phone</Label>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                    <p className="text-sm">{job.technicians.phone}</p>

                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cost & Time Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Cost & Time Tracking
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p>Est. Time: {job.eta || "TBC"}</p>
                                    </div>
                                    {job.estimatedCost && (
                                        <div>
                                            <Label className="text-sm font-medium">Estimated Cost</Label>
                                            <p className="text-sm">R {job.estimatedCost.toFixed(2)}</p>
                                        </div>
                                    )}
                                    {job.actualCost && (
                                        <div>
                                            <Label className="text-sm font-medium">Actual Cost</Label>
                                            <p className="text-sm">R {job.actualCost.toFixed(2)}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status Update Actions */}
                        {canUpdateStatus && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Status</CardTitle>
                                    <CardDescription>Change the current status of this job</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            variant={job.status === "assigned" ? "default" : "outline"}
                                            // onClick={() => handleStatusUpdate("assigned")}
                                            size="sm"
                                        >
                                            Assigned
                                        </Button>
                                        <Button
                                            variant={job.status === "inprogress" ? "default" : "outline"}
                                            // onClick={() => handleStatusUpdate("inprogress")}
                                            size="sm"
                                        >
                                            In Progress
                                        </Button>
                                        <Button
                                            variant={job.status === "awaiting-approval" ? "default" : "outline"}
                                            // onClick={() => handleStatusUpdate("awaiting-approval")}
                                            size="sm"
                                        >
                                            Awaiting Approval
                                        </Button>
                                        {canApproveJobs && (
                                            <>
                                                <Button
                                                    variant={job.status === "approved" ? "default" : "outline"}
                                                    // onClick={() => handleStatusUpdate("approved")}
                                                    size="sm"
                                                >
                                                    Approved
                                                </Button>
                                                <Button
                                                    variant={job.status === "completed" ? "default" : "outline"}
                                                    // onClick={() => handleStatusUpdate("completed")}
                                                    size="sm"
                                                >
                                                    Completed
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant={job.status === "cancelled" ? "destructive" : "outline"}
                                            // onClick={() => handleStatusUpdate("cancelled")}
                                            size="sm"
                                        >
                                            Cancelled
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Job Timeline
                                </CardTitle>
                                <CardDescription>Complete history of all job activities</CardDescription>
                            </CardHeader>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Notes & Communication
                                </CardTitle>
                                <CardDescription>Add notes and view communication history</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Add New Note */}
                                <div className="space-y-2">
                                    <Label htmlFor="new-note">Add New Note</Label>
                                    <Textarea
                                        id="new-note"
                                        placeholder="Enter your note here..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                        Add Note
                                    </Button>
                                </div>

                                <Separator />

                                {/* Existing Notes */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Previous Notes</h4>
                                    {job.notes && job.notes.length > 0 ?
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm">{job.notes}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Added on {new Date().toLocaleDateString()}
                                            </p>
                                        </div>
                                        : (
                                            <div className="text-center py-4 text-gray-500">
                                                <p>No notes available</p>
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attachments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileImage className="h-5 w-5" />
                                    Attachments & Documents
                                </CardTitle>
                                <CardDescription>Photos, reports, and other job-related files</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(!job.attachments || job.attachments.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No attachments available</p>
                                    </div>
                                )}

                                {job.attachments && job.attachments.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {job.attachments.map((attachment, index) => {
                                                const { data } = supabase.storage.from('images').getPublicUrl(attachment);
                                                const url = data?.publicUrl;
                                                const attachments = job.attachments as unknown as string[];
                                                // const url = attachments[index] as string;
                                                console.log(url)
                                                return (
                                                    <div key={index} className="flex flex-col items-center gap-1 p-4 hover:shadow-md transition-shadow cursor-pointer">
                                                        <div className="flex flex-row gap-2">
                                                            <FileImage className="h-8 w-8 text-blue-500" />
                                                            <p className="font-medium text-sm">{attachment}</p>
                                                        </div>
                                                        {url && (
                                                            <img
                                                                src={url}
                                                                alt={`Attachment ${index}`}
                                                                className="h-20 w-20 object-cover rounded"
                                                            />
                                                        )}
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="outline" size="icon" className="w-fit p-2">
                                                                <Download className="h-4 w-4" />
                                                                <span className="text-xs text-gray-500">Click to view</span>
                                                            </Button>
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

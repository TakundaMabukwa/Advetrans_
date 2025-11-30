"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecureButton } from "@/components/SecureButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  MapPin,
  User,
  Truck,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Edit,
  MessageSquare,
  FileImage,
  Download,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { map, nullable } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { is, se } from "date-fns/locale";
import Modal from "@/components/modals/modal";

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
    length: number;
    first_name: string | null;
    surname: string | null;
    cell_number: string | null;
    job_allocated: boolean;
  } | null; // Note: single object or null

  vehiclesc: {
    length: number;
    registration_number: string | null;
    make: string | null;
    model: string | null;
  } | null; // single object or null

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
  id: number;
  name: string;
  surname: string;
  phone: string;
  location: string;
  rating: string;
  specialties: string[];
}

export default function FleetJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [completed, setCompleted] = useState<Job[]>([]);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTechnicianLocation, setSearchTechnicianLocation] = useState("");
  const [selectedJobForTech, setSelectedJobForTech] = useState<Job | null>(
    null
  );
  const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "inprogress":
        return "bg-orange-100 text-orange-800";
      case "awaiting-approval":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "Breakdown Request":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleUpdateJobStatus = async (
    jobId: number,
    status: string,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("job_assignments")
        .update({
          status: status,
          notes: notes || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (error) {
        console.error("Error updating job status:", error);
        return;
      }

      setIsUpdateDialogOpen(false);
      setNewStatus("");
      setUpdateNotes("");
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const canApproveJobs = userRole === "fleet-manager";
  const canUpdateStatus =
    userRole === "call-center" || userRole === "fleet-manager";

  // Sync input when selectedJobForTech changes
  useEffect(() => {
    if (selectedJobForTech?.location) {
      setSearchTechnicianLocation(selectedJobForTech.location);
    } else {
      setSearchTechnicianLocation("");
    }
  }, [selectedJobForTech]);

  const getJobs = async () => {
    const { data: jobs, error } = await supabase
      .from("job_assignments")
      .select(
        `
      *,
      drivers (*),
      vehiclesc (*),
      technicians:technician_id(*)
    `
      )
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setJobs(jobs as unknown as Job[]);
      console.log(jobs);
    }
  };

  const getCompletedJobs = async () => {
    const { data: jobs, error } = await supabase
      .from("job_assignments")
      .select(
        `
      *,
      drivers (*),
      vehiclesc (*),
      technicians:technician_id(*)
    `
      )
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setCompleted(jobs as unknown as Job[]);
      console.log(jobs);
    }
  };

  // Fetch technicians from Supabase
  const fetchTechnicians = async () => {
    const { data, error } = await supabase.from("technicians").select("*");
    if (error) {
      console.error("Error fetching technicians:", error);
      setTechnicians([]); // Optional fallback
    } else {
      const mappedTechnicians = data.map((tech) => ({
        id: tech.id,
        name: tech.name,
      }));
      setTechnicians(mappedTechnicians as unknown as Technician[]);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  // Assign the selected technician to the job
  const assignTechnicianToJob = async (
    technicianId: number,
    technicianName: string
  ) => {
    if (!selectedJobForTech) return;

    const { error } = await supabase
      .from("job_assignments")
      .update({
        technician_id: technicianId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedJobForTech.id);

    if (error) {
      toast.error("Failed to assign technician.");
      console.error(error);
    } else {
      toast.success(`Assigned ${technicianName} to job.`);
      setIsTechDialogOpen(false);
      // Optionally refresh jobs here if you keep jobs state elsewhere
    }
  };

  useEffect(() => {
    const assignements = supabase
      .channel("public:assignments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignments" },
        (payload) => {
          console.log("Change received in assignments table!", payload);
          // Handle any updates to the assignments table
          getJobs(); // Re-fetch jobs if needed or adjust to only update certain fields
        }
      )
      .subscribe();

    const jobAssignments = supabase
      .channel("public:job_assignments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_assignments" }, // Only listen to insert events
        (payload) => {
          console.log("New job added:", payload);
          // When a new job is inserted, add it to the jobs state
          getJobs(); // Add the new job to the front of the list
        }
      )
      .subscribe();
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "call-center";
    setUserRole(role);

    getJobs();
    getCompletedJobs();

    return () => {
      jobAssignments.unsubscribe();
      assignements.unsubscribe();
    };
  }, []);

  // Fetch initial data when the component mounts
  useEffect(() => {
    getJobs();
  }, []);
  // Filter jobs once data is loaded
  // Use useEffect dependency array to trigger after jobs state is set
  useEffect(() => {
    if (jobs.length > 0) {
      setFilteredJobs(jobs); // Now set filtered jobs after jobs are updated
    }
  }, [jobs]); // This effect will run when jobs change
  // setFilteredJobs(jobs)
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((job) => {
        const searchLower = searchTerm.toLowerCase();

        // Basic job fields
        if (
          job.job_id?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower)
        ) {
          return true;
        }

        // Driver information
        if (job.drivers) {
          const driverName = job.drivers?.first_name?.toLowerCase() || "";
          const driverSurname = job.drivers?.surname?.toLowerCase() || "";
          if (
            driverName.includes(searchLower) ||
            driverSurname.includes(searchLower)
          ) {
            return true;
          }
        }

        // Vehicle information
        if (job.vehiclesc) {
          const regNumber = job.vehiclesc.registration_number || "";
          const make = job.vehiclesc.make || "";
          const model = job.vehiclesc.model || "";
          if (
            regNumber.toLowerCase().includes(searchLower) ||
            make.toLowerCase().includes(searchLower) ||
            model.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
        }

        return false;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((job) => job.priority === priorityFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, priorityFilter]);

  const handleRefreshClick = () => {
    getJobs();
  };

  useEffect(() => {
    handleRefreshClick();
  }, []);

  // Assume selectedJobForTech is set when you open the assign dialog

  const filteredTechnicians = technicians.filter((tech) => {
    if (!selectedJobForTech?.location || !tech.location) return false;

    // Split job location and tech location into lowercase keyword arrays
    const jobLocationTerms = selectedJobForTech.location
      .toLowerCase()
      .split(/[\s,]+/);
    const techLocationTerms = tech.location.toLowerCase().split(/[\s,]+/);

    // Check if any job location term appears in the tech location terms
    return jobLocationTerms.some((term) => techLocationTerms.includes(term));
  });

  // Close the job
  const closeJob = async (jobId: string) => {
    const { error } = await supabase
      .from("job_assignments")
      .update({ status: "closed" })
      .eq("job_id", jobId);

    if (error) {
      console.error("Error closing job:", error);
    } else {
      console.log("Job closed successfully");
      getJobs();
    }
  };

  const handleCloseJob = (jobId: string) => {
    if (confirm("Are you sure you want to close this job?")) {
      closeJob(jobId);
    }
  };
  const handleChangeDetails = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">All Jobs</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
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
                <SelectItem value="Breakdown Request">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="Breakdown Request">
                  Breakdown Request
                </SelectItem>
                <SelectItem value="Technician on site">
                  Technician On Site
                </SelectItem>
                <SelectItem value="Technician accepted">
                  Technician accepted
                </SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {/* <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select> */}

            {/* Refresh Button */}
            <div className="mt-4">
              <button onClick={handleRefreshClick}>
                <RefreshCcw />
              </button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Job List</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg">
                              {job.job_id} :{" "}
                              {job?.vehiclesc?.registration_number ||
                                "No vehicle allocated"}{" "}
                            </CardTitle>
                          </div>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority}
                          </Badge>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          {job.clientType === "external" && (
                            <Badge variant="outline">External</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}{" "}
                            {new Date(job.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <CardDescription className="text-base font-medium">
                        {job.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {job.drivers ? (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Driver Information
                            </h4>
                            <p className="text-sm">
                              <strong>Name:</strong> {job.drivers.first_name}{" "}
                              {job.drivers.surname}
                            </p>
                            <p className="text-sm">
                              <strong>Phone:</strong> {job.drivers.cell_number}
                            </p>
                            {job.clientName && (
                              <p className="text-sm">
                                <strong>Client:</strong> {job.clientName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Driver Information
                            </h4>
                          </div>
                        )}
                        {job.vehiclesc ? (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Vehicle Details
                            </h4>
                            <p className="text-sm">
                              <strong>Reg:</strong>{" "}
                              {job.vehiclesc.registration_number ||
                                "No vehicle allocated"}
                            </p>
                            <p className="text-sm">
                              <strong>Make:</strong>{" "}
                              {job.vehiclesc.make || "No vehicle allocated"}
                            </p>
                            <p className="text-sm">
                              <strong>Model:</strong>{" "}
                              {job.vehiclesc.model || "No vehicle allocated"}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Vehicle Details
                            </h4>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.location}
                          </p>
                          {job.technicians ? (
                            <>
                              <p className="text-sm">
                                <strong>Tech:</strong> {job.technicians?.name}
                              </p>
                              <p className="text-sm">
                                <strong>Phone:</strong> {job.technicians?.phone}
                              </p>
                            </>
                          ) : (
                            job.technician_id && (
                              <p className="text-sm">
                                <strong>Tech ID:</strong> {job.technician_id}
                              </p>
                            )
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            Time
                          </h4>
                          <p className="text-sm">
                            <strong>Arrival Est. Time:</strong>{" "}
                            {job.eta || "TBC"}
                          </p>

                          <p className="text-sm">
                            <strong>Job Created Time: </strong>
                            {new Date(job.created_at).toLocaleDateString()}{" "}
                            {new Date(job.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-sm">
                            <strong>Time Completed:</strong>{" "}
                            {job.completed_at || "TBC"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          {job.description}
                        </p>
                      </div>
                      {job.notes && job.notes.length > 0 && (
                        <div className="bg-gray-100 p-3 rounded-md flex items-center gap-2 mb-4">
                          <MessageSquare className="h-5 w-5" />
                          <span>
                            {job.notes.length === 1
                              ? "1 new note available"
                              : `+new notes available`}
                          </span>
                        </div>
                      )}

                      {job.attachments && job.attachments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <FileImage className="h-4 w-4" />
                            Attachments
                          </h4>
                          <div className="flex gap-2 flex-wrap">
                            {job.attachments.map((attachment, index) => {
                              const { data } = supabase.storage
                                .from("images")
                                .getPublicUrl(attachment);
                              const url = data?.publicUrl;
                              const attachments =
                                job.attachments as unknown as string[];
                              // const url = attachments[index] as string;
                              console.log(url);
                              return (
                                <div
                                  key={index}
                                  className="flex flex-col items-center gap-1"
                                >
                                  {url && (
                                    <img
                                      src={url}
                                      alt={`Attachment ${index}`}
                                      className="h-20 w-20 object-cover rounded"
                                    />
                                  )}
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="flex flex-row gap-2 w-fit p-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>View Image</span>
                                    </Button>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {job.attachments &&
                        Array.isArray(job.attachments) &&
                        job.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <FileImage className="h-4 w-4" />
                              Result Images
                            </h4>
                            <div className="flex gap-2 flex-wrap">
                              {job.attachments.map((imagePath, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center gap-2"
                                >
                                  {/* Don't attempt to render local file URIs directly */}
                                  {imagePath.startsWith("file:///") ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs text-red-500"
                                    >
                                      Local image — not viewable in browser
                                    </Badge>
                                  ) : (
                                    <img
                                      src={imagePath}
                                      alt={`Result ${index}`}
                                      className="h-20 w-20 object-cover rounded border"
                                    />
                                  )}
                                  <a
                                    href={imagePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="outline" size="icon">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Link href={`/jobsFleet/${job.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <SecureButton
                            page="fleetJobs"
                            action="edit"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleChangeDetails(job)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Job
                          </SecureButton>
                        </div>

                        {/* <div>
                            {!job.technician_id && (
                              <Button
                                onClick={() => {
                                  setSelectedJobForTech(job);
                                  setIsTechDialogOpen(true);
                                }}
                              >
                                Assign Technician
                              </Button>
                            )}
                          </div> */}

                        {job.status === "awaiting-approval" &&
                          canApproveJobs && (
                            <div className="flex gap-2">
                              <SecureButton
                                page="fleetJobs"
                                action="edit"
                                onClick={() =>
                                  handleUpdateJobStatus(
                                    job.id,
                                    "approved",
                                    "Job approved by fleet manager"
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </SecureButton>
                              <SecureButton
                                page="fleetJobs"
                                action="delete"
                                variant="destructive"
                                onClick={() =>
                                  handleUpdateJobStatus(
                                    job.id,
                                    "cancelled",
                                    "Job rejected by fleet manager"
                                  )
                                }
                                size="sm"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </SecureButton>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">No jobs found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                "Breakdown Request",
                "inprogress",
                "assigned",
                "Technician accepted",
                "Technician on site",
                "completed",
              ].map((status) => (
                <Card key={status}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium capitalize">
                      {status}
                      <Badge className="ml-2" variant="secondary">
                        {
                          filteredJobs.filter((job) => job.status === status)
                            .length
                        }
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredJobs
                      .filter((job) => job.status === status)
                      .map((job) => (
                        // <Card key={job.id} className="p-3 hover:shadow-sm transition-shadow cursor-pointer">
                        <Card
                          key={job.id}
                          className="p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {job.job_id}
                              </p>
                              <Badge className={getPriorityColor(job.priority)}>
                                {job.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              {job.estimatedCost && (
                                <span>R {job.estimatedCost}</span>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Jobs
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                  <p className="text-xs text-muted-foreground">All Jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobs.filter((job) => job.status === "inprogress").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active jobs being worked on
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      completed.filter((job) => job.status === "completed")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully completed jobs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Cost
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R304</div>
                  <p className="text-xs text-muted-foreground">
                    Average job cost
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
                <CardDescription>Overview of all job statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Breakdown Request",
                    "assigned",
                    "Technician on site",
                    "Technician accepted",
                    "inprogress",
                    "awaiting-approval",
                    "approved",
                    // "completed",
                    "cancelled",
                  ].map((status) => {
                    const count = jobs.filter(
                      (job) => job.status === status
                    ).length;
                    const percentage =
                      jobs.length > 0 ? (count / jobs.length) * 100 : 0;
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          <span className="text-sm">{count} jobs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Modal
                request={selectedJob}
                onClose={() => setIsModalOpen(false)}
                onUpdateStatus={(status) =>
                  handleUpdateJobStatus(selectedJob.id, status)
                }
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

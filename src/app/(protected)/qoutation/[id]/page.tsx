"use client";

import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
    id: string;
    drivername?: string;
    vehiclereg?: string;
    job_type?: string;
    issue?: string;
    parts_needed?: string[];
    laborcost?: number;
    partscost?: number;
    totalcost?: number;
    priority?: string;
    status: "pending" | "approved" | "rejected" | "pending-inspection" | "paid" | "pending-approval";
    created_at: string;
    description?: string;
    markupPrice?: number; // percentage markup number
    type: "external" | "internal";
    additional_notes: string,
    job_id: Job;
}

export default function QuotationDetailPage() {
    const { id } = useParams();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const supabase = createClient();

    const fetchQuotation = async () => {
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
            .eq("id", String(id))
            .single();

        if (error) {
            toast.error("Failed to load quotation");
            console.error(error);
        } else {
            setQuotation(data as unknown as Quotation);
        }
        setLoading(false);
    };

    const updateStatus = async (newStatus: "approved" | "rejected" | "pending-inspection" | "paid") => {
        if (!quotation) return;
        setUpdating(true);

        const { error } = await supabase
            .from("quotations")
            .update({ status: newStatus })
            .eq("id", quotation.id);

        if (error) {
            alert("Failed to update status");
            console.error(error);
        } else {
            alert(`Successful Updated Quotation ${newStatus}`);
            setQuotation({ ...quotation, status: newStatus });
        }
        setUpdating(false);
    };

    useEffect(() => {
        if (id) fetchQuotation();
    }, [id]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!quotation) return <div className="text-center mt-10">Quotation not found</div>;

    return (
        <div className="w-full h-full p-6 bg-gray-50">
            {/* Back Button */}
            <div className="">
                <Button
                    onClick={() => { redirect("/qoutation"); }}
                    className="px-4 py-2 text-white bg-black rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300"
                >
                    Back
                </Button>
            </div>

            <div className="max-w-7xl mx-auto pt-16">
                <div className="mb-6">
                    <h1 className="text-4xl font-semibold text-gray-800">Repair {(quotation.id).slice(0, 8)}</h1>
                </div>

                <Card className="shadow-lg border border-gray-200 rounded-lg">
                    <CardHeader className="bg-gray-50 rounded-t-lg p-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">Quotation Details</CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 space-y-8 text-sm text-gray-700">
                        {/* General Information Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">General Information</h2>
                            <div className="flex gap-2 items-center">
                                <span><strong>Status:</strong></span>
                                <Badge variant={
                                    quotation.status === "approved" ? "default"
                                        : quotation.status === "rejected" ? "destructive"
                                            : quotation.status === "paid" ? "default"
                                                : quotation.status === "pending-inspection" ? "destructive"
                                                    : "secondary"
                                }>
                                    {quotation.status}
                                </Badge>
                            </div>
                            <div><strong>Driver:</strong> {quotation.job_id.drivers?.first_name}</div>
                            <div><strong>Vehicle:</strong> {quotation.job_id.vehiclesc?.registration_number} {quotation.job_id.vehiclesc?.make}</div>
                            <div><strong>Technician: {quotation.job_id?.technicians?.name}</strong></div>
                            <div><strong>Job Type:</strong> {quotation.job_type}</div>
                            <div><strong>Priority:</strong> {quotation.priority}</div>
                            <div><strong>Notes:</strong> {quotation.additional_notes}</div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                            <div><strong>Description:</strong> {quotation.issue}</div>
                            <div><strong>Parts Needed:</strong>
                                {quotation.parts_needed && quotation.parts_needed.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {quotation.parts_needed.map((part, index) => {
                                                let partName = part;
                                                let partPrice = "";
                                                try {
                                                    const parsed = JSON.parse(part);
                                                    if (parsed && parsed.name) partName = parsed.name;
                                                    if (parsed && parsed.price !== undefined) partPrice = ` - R${parsed.price.toFixed(2)}`;
                                                } catch {
                                                    // part is just a string without price info
                                                }
                                                return (
                                                    <Badge key={index} variant="outline">
                                                        {partName}{partPrice}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}</div>
                        </div>

                        {/* Cost Breakdown Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Cost Breakdown</h2>
                            <div><strong>Labor Cost:</strong> R {quotation.laborcost?.toFixed(2)}</div>
                            <div><strong>Parts Cost:</strong> R {quotation.partscost?.toFixed(2)}</div>
                            <div><strong>Total Cost:</strong> R {quotation.totalcost?.toFixed(2)}</div>
                        </div>

                        {/* Created At Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Created At</h2>
                            <div><strong>Created At:</strong> {new Date(quotation.created_at).toLocaleString()}</div>
                        </div>

                        {/* Action Buttons for Pending Status */}
                        {quotation.status === "pending-approval" && (
                            <div className="flex gap-4 mt-6">
                                <Button
                                    variant="default"
                                    disabled={updating}
                                    onClick={() => updateStatus("approved")}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 transition-all duration-300"
                                >
                                    Approve
                                </Button>
                                {/* <Button
                                    variant="outline"
                                    disabled={updating}
                                    onClick={() => updateStatus("paid")}
                                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-100 disabled:bg-gray-200 transition-all duration-300"
                                >
                                    Paid
                                </Button> */}
                                <Button
                                    variant="destructive"
                                    disabled={updating}
                                    onClick={() => updateStatus("rejected")}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 transition-all duration-300"
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
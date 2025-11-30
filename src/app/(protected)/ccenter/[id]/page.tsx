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
    id: number;
    name: string;
    surname: string;
    phone: string;
    location: string;
    rating: string;
    specialties: string[];
    workshop_id?: Workshop;
}

interface Quotation {
    id: string;
    drivername?: string;
    vehiclereg?: string;
    job_type?: string;
    issue?: string;
    parts_needed?: string[]; // just part names
    laborcost?: number;
    partscost?: number; // total parts cost number
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

interface Workshop {
    workshop_id: string;
    labour_rate: number;
}

export default function QuotationDetailPage() {
    const { id } = useParams();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const supabase = createClient();
    const [labour, setLabour] = useState(0)

    // Manage parts as strings (names)
    const [parts, setParts] = useState<string[]>([]);
    const [newPartName, setNewPartName] = useState("");
    // Manage parts total cost input (price side)
    const [partsCost, setPartsCost] = useState<number>(0);
    // Markup percentage
    const [markupPrice, setMarkupPrice] = useState<number>(0);


    const fetchWorkshop = async (workshopId: string | undefined) => {
        if (!workshopId) return null;
        const { data, error } = await supabase
            .from('workshop')
            .select('*')
            .eq('id', workshopId)
            .single();

        if (error) {
            console.error('Failed to load workshop:', error);
            return null;
        }

        if (typeof data?.labour_rate === 'number') {
            setLabour(data.labour_rate);
        } else {
            setLabour(0);
        }
        return data;
    }

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
                    technicians:technician_id (*)
                    )
                `)
            .eq("id", String(id))
            .single();


        if (error) {
            toast.error("Failed to load quotation");
            console.error(error);
        }
        setQuotation(data as unknown as Quotation);

        // fetch workshop separately using technician.workshop_id
        if (data?.job_id && data?.job_id.technicians && data.job_id.technicians.workshop_id) {
            const workshopData = await fetchWorkshop(data.job_id.technicians.workshop_id);
            if (workshopData) {
                setQuotation((prev) => prev ? { ...prev, job_id: { ...prev.job_id, workshop: workshopData } } : prev);
            }
        }
        else {
            setParts(data?.parts_needed || []);
            setPartsCost(data?.partscost || 0);
            setMarkupPrice(data?.markupPrice || 0);
            setQuotation(data as unknown as Quotation);
        }
        setLoading(false);
        setLoading(false);
    };


    // Calculate total cost with markup applied
    const calculateTotalCost = (
        labor: number = 0,
        partsCostVal: number,
        markup: number
    ) => {
        const baseTotal = labor + partsCostVal;
        const markupAmount = (baseTotal * markup) / 100;
        return baseTotal + markupAmount;
    };

    // Add a new part name
    const addPart = () => {
        if (!newPartName.trim()) {
            toast.error("Part name is required");
            return;
        }
        if (parts.includes(newPartName.trim())) {
            toast.error("Part already added");
            return;
        }
        setParts([...parts, newPartName.trim()]);
        setNewPartName("");
    };

    // Remove part by name
    const removePart = (name: string) => {
        setParts(parts.filter((p) => p !== name));
    };

    // Save updated parts, parts cost, markup and recalc total cost
    const updateQuotation = async () => {
        if (!quotation) return;
        setUpdating(true);

        const totalCost = calculateTotalCost(quotation.laborcost || 0, partsCost, markupPrice);

        const { error } = await supabase
            .from("quotations")
            .update({
                parts_needed: parts,
                partscost: partsCost,
                markupPrice,
                totalcost: totalCost,
                status: "pending-approval",
            })
            .eq("id", quotation.id);

        if (error) {
            toast.error("Failed to update quotation");
            alert("Failed to update qoutation");
            console.error(error);
        } else {
            toast.success("Quotation updated");
            setQuotation({
                ...quotation,
                parts_needed: parts,
                partscost: partsCost,
                markupPrice,
                totalcost: totalCost,
                status: "pending-approval"
            });
            alert("Submitted successfully")
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
                    onClick={() => {
                        redirect("/ccenter");
                    }}
                    className="px-4 py-2 text-white bg-black rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300"
                >
                    Back
                </Button>
            </div>

            <div className="max-w-7xl mx-auto pt-4">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-800">Repair {(quotation.id).slice(0, 8)}</h1>
                    <div>
                        <strong>Quote Type: </strong>
                        <Badge variant={quotation.type === "external" ? "secondary" : "default"}>
                            {quotation.type}
                        </Badge>
                    </div>
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
                                <span>
                                    <strong>Status:</strong>
                                </span>
                                <Badge
                                    variant={
                                        quotation.status === "approved"
                                            ? "default"
                                            : quotation.status === "rejected"
                                                ? "destructive"
                                                : quotation.status === "paid"
                                                    ? "default"
                                                    : quotation.status === "pending-inspection"
                                                        ? "destructive"
                                                        : "secondary"
                                    }
                                >
                                    {quotation.status}
                                </Badge>
                            </div>
                            <div>
                                <strong>Driver:</strong> {quotation.job_id.drivers?.first_name}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Technician: {quotation.job_id?.technicians?.name}</p>
                            </div>
                            <div>
                                <strong>Vehicle:</strong> {quotation.job_id.vehiclesc?.registration_number}
                            </div>
                            <div>
                                <strong>Job Type:</strong> {quotation.job_type}
                            </div>
                            <div>
                                <strong>Priority:</strong> {quotation.priority}
                            </div>
                            <div>
                                <strong>Issue:</strong> {quotation.additional_notes}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                            <div className="flex flex-row justify-evenly">
                                <div>
                                    <strong>Description:</strong> {quotation.issue}
                                </div>
                                <div>
                                    <strong>Labour:</strong> R {labour || 0}
                                </div>
                            </div>

                        </div>

                        {/* Parts Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Parts</h2>

                            {parts.length === 0 && <div>No parts added yet</div>}
                            {quotation.parts_needed && quotation.parts_needed.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold mb-2">Parts Needed:</p>
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
                            )}

                            <div className="flex space-x-2 items-center mt-4">
                                <input
                                    type="text"
                                    placeholder="Part Name"
                                    value={newPartName}
                                    onChange={(e) => setNewPartName(e.target.value)}
                                    className="border p-2 rounded flex-grow"
                                />
                                <Button onClick={addPart} disabled={updating}>
                                    Add Part
                                </Button>
                            </div>

                            <div className="mt-4 flex items-center space-x-4">
                                <label htmlFor="partsCost" className="font-semibold">
                                    Total Parts Cost (R):
                                </label>
                                <input
                                    type="number"
                                    id="partsCost"
                                    min={0}
                                    step={0.01}
                                    value={partsCost}
                                    onChange={(e) => setPartsCost(parseFloat(e.target.value) || 0)}
                                    className="border rounded p-2 w-40"
                                    disabled={updating}
                                />
                            </div>

                            <div className="mt-4 flex items-center space-x-4">
                                <label htmlFor="markupPrice" className="font-semibold">
                                    Markup (%):
                                </label>
                                <input
                                    type="number"
                                    id="markupPrice"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={markupPrice}
                                    onChange={(e) => setMarkupPrice(parseFloat(e.target.value) || 0)}
                                    className="border rounded p-2 w-24"
                                    disabled={updating}
                                />
                            </div>
                        </div>

                        {/* Cost Breakdown Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Cost Breakdown</h2>
                            <div>
                                <strong>Labor Cost:</strong> R {quotation.laborcost?.toFixed(2)}
                            </div>
                            <div>
                                <strong>Parts Cost:</strong> R {partsCost.toFixed(2)}
                            </div>
                            <div>
                                <strong>Total Cost:</strong> R{" "}
                                {calculateTotalCost(quotation.laborcost || 0, partsCost, markupPrice).toFixed(2)}
                            </div>
                        </div>

                        {/* Created At Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800">Created At</h2>
                            <div>
                                <strong>Created At:</strong> {new Date(quotation.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button onClick={updateQuotation} disabled={updating}>
                                {updating ? "Saving..." : "Submit Changes"}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => fetchQuotation()}
                                disabled={updating}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

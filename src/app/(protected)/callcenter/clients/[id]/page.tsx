"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Building2, Banknote, FileText, Car, ArrowLeftCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface Workshop {
    id: string;
    work_name: string;
    trading_name: string | null;
    number_of_working_days: number | null;
    labour_rate: number | null;
    fleet_rate: number | null;
    company_registration_doc: string | null;
    after_hours_number: string | null;
    franchise: string | null;
    vat_number: number | null;
    vat_certificate: string | null;
    vat_cert_expiry_date: string | null;
    bbbee_level: string | null;
    hdi_perc: string | null;
    bbbee_expire_date: string | null;
    insurance_policy_number: number | null;
    insurance_company_name: string | null;
    bank_name: string | null;
    account_no: number | null;
    bank_letter: string | null;
    province: string | null;
    street: string | null;
    city: string | null;
    town: string | null;
    postal_code: number | null;
    created_at: string | null;
    vehicles_type: string[] | null;
    workshop_type: string[] | null;
    validated: string;
}

export default function WorkshopDetailsPage() {
    const params = useParams();
    const supabase = createClient();
    const [workshop, setWorkshop] = useState<Workshop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (status: string, workshopId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("workshop")
                .update({ validated: status })
                .eq("id", workshopId);
            console.log("updated: " + data)
            toast.success("Successfully updated workshop");
        } catch (err: any) {
            setError("Failed to update status: " + err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchWorkshop = async () => {
            const { data, error } = await supabase
                .from("workshop")
                .select("*")
                .eq("id", typeof params.id === "string" ? params.id : "")
                .single();

            if (!error && data) setWorkshop(data as Workshop);
            setLoading(false);
        };

        fetchWorkshop();
    }, [params.id]);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!workshop) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                No workshop details found.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-start">
                <Link href="/callcenter/clients">
                    <Button>
                        <ArrowLeftCircle /> <span className="ml-2">Back</span>
                    </Button>
                </Link>
            </div>


            {/* Header */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold">{workshop.work_name}</CardTitle>
                        {workshop.trading_name && (
                            <p className="text-muted-foreground">{workshop.trading_name}</p>
                        )}
                    </div>
                    <Badge
                        variant={
                            workshop.validated === "approved"
                                ? "default"
                                : workshop.validated === "pending"
                                    ? "secondary"
                                    : "destructive"
                        }
                        className="capitalize mt-2 md:mt-0"
                    >
                        {workshop.validated}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {workshop.city}, {workshop.province}
                    </div>
                    {workshop.after_hours_number && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" /> {workshop.after_hours_number}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sections */}
            <Card>
                <CardHeader>
                    <CardTitle>Workshop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Info label="Working Days" value={workshop.number_of_working_days} />
                        <Info label="Labour Rate" value={`R ${workshop.labour_rate ?? 0}`} />
                        <Info label="Fleet Rate" value={`R ${workshop.fleet_rate ?? 0}`} />
                        <Info label="Franchise" value={workshop.franchise} />
                    </div>

                    <Separator />

                    {/* Vehicle Types & Workshop Types */}
                    <div>
                        <p className="font-semibold">Vehicle Types:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {workshop.vehicles_type?.map((v) => (
                                <Badge key={v} variant="outline">
                                    <Car className="w-3 h-3 mr-1" />
                                    {v}
                                </Badge>
                            )) || <p className="text-muted-foreground">Not provided</p>}
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold">Workshop Types:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {workshop.workshop_type?.map((w) => (
                                <Badge key={w} variant="outline">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    {w}
                                </Badge>
                            )) || <p className="text-muted-foreground">Not provided</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Financial & Compliance */}
            <Card>
                <CardHeader>
                    <CardTitle>Compliance & Financial Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="VAT Number" value={workshop.vat_number} />
                    <Info label="BBBEE Level" value={workshop.bbbee_level} />
                    <Info label="HDI %" value={workshop.hdi_perc} />
                    <Info label="Insurance Policy #" value={workshop.insurance_policy_number} />
                    <Info label="Insurance Company" value={workshop.insurance_company_name} />
                    <Info label="Bank Name" value={workshop.bank_name} />
                    <Info label="Account No" value={workshop.account_no} />
                </CardContent>
            </Card>

            {/* Location */}
            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p>{workshop.street}</p>
                    <p>{workshop.city}, {workshop.town}</p>
                    <p>{workshop.province} - {workshop.postal_code}</p>
                </CardContent>
            </Card>

            <div className="flex flex-row gap-3">
                <Button
                    onClick={() => handleSubmit("validated", workshop.id)}
                    disabled={loading}
                    variant="default"
                >
                    Validated
                </Button>

                <Button
                    onClick={() => handleSubmit("rejected", workshop.id)}
                    disabled={loading}
                    variant="destructive"
                >
                    Block
                </Button>

                <Button
                    onClick={() => handleSubmit("pending", workshop.id)}
                    disabled={loading}
                    variant="secondary"
                >
                    Under Review
                </Button>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-medium">{value ?? "N/A"}</p>
        </div>
    );
}

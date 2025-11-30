"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

interface Technician {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Breakdown {
  id: string;
  order_no: string;
  status: string;
  registration: string;
  make: string;
  model: string;
  year: string;
  reported_at: string;
  breakdown_type: string;
  fuel_type: string;
  colour: string;
  transmission_type: string;
  client_type: string;
  tech_id: string;
  technicians?: Technician;
  workshop_id? : Workshop;
}

interface Workshop{
  trading_name: string,
  street: string,
  city:  string
}

export default function BreakdownPage() {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBreakdowns = async () => {
      const { data, error } = await supabase
        .from("breakdowns")
        .select(`
          id,
          order_no,
          status,
          registration,
          make,
          model,
          year,
          reported_at,
          breakdown_type,
          fuel_type,
          colour,
          transmission_type,
          client_type,
          tech_id,
          technicians (
            id,
            name,
            phone,
            email
          ),
          workshop(*)
        `);

      if (error) {
        console.error("Error fetching breakdowns:", error.message);
      } else {
        const mappedData = (data || []).map((item: any) => ({
          id: String(item.id),
          order_no: item.order_no ?? "",
          status: item.status ?? "",
          registration: item.registration ?? "",
          make: item.make ?? "",
          model: item.model ?? "",
          year: item.year ? String(item.year) : "",
          reported_at: item.reported_at ?? "",
          breakdown_type: item.breakdown_type ?? "",
          fuel_type: item.fuel_type ?? "",
          colour: item.colour ?? "",
          transmission_type: item.transmission_type ?? "",
          client_type: item.client_type ?? "",
          tech_id: item.tech_id ? String(item.tech_id) : "",
          technicians: item.technicians
            ? {
                id: String(item.technicians.id),
                name: item.technicians.name ?? "",
                phone: item.technicians.phone ?? "",
                email: item.technicians.email ?? "",
              }
            : undefined,
        }));
        setBreakdowns(mappedData);
      }
      setLoading(false);
    };

    fetchBreakdowns();
  }, []);

  const statusColors: Record<string, string> = {
    requested: "bg-yellow-500 text-white",
    in_progress: "bg-blue-500 text-white",
    completed: "bg-green-500 text-white",
    cancelled: "bg-red-500 text-white",
  };

  const stats = {
    total: breakdowns.length,
    requested: breakdowns.filter((b) => b.status === "requested").length,
    in_progress: breakdowns.filter((b) => b.status === "in_progress").length,
    completed: breakdowns.filter((b) => b.status === "completed").length,
    cancelled: breakdowns.filter((b) => b.status === "cancelled").length,
  };

  const filterBreakdowns = (status: string) => {
    if (status === "all") return breakdowns;
    if (status === "active") return breakdowns.filter((b) => b.status === "requested" || b.status === "in_progress");
    return breakdowns.filter((b) => b.status === status);
  };

  if (loading) return <p className="p-6 text-center text-lg">Loading breakdowns...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* ✅ Back Button */}
      <div>
        <Button variant="ghost" className="flex items-center gap-2" onClick={() => history.back()}>
          <ArrowLeft size={18} /> Back
        </Button>
      </div>

      {/* ✅ Tabs for Status Filters */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          {/* <TabsTrigger value="completed">Completed</TabsTrigger> */}
          {/* <TabsTrigger value="cancelled">Cancelled</TabsTrigger> */}
        </TabsList>

        {/* ✅ Each Tab has stats + breakdown list */}
        {["all", "active", "requested", "in_progress", "completed", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {/* ✅ Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className="text-center p-4 bg-blue-50">
                <CardTitle>Total</CardTitle>
                <p className="text-2xl font-bold">{stats.total}</p>
              </Card>
              <Card className="text-center p-4 bg-yellow-50">
                <CardTitle>Requested</CardTitle>
                <p className="text-2xl font-bold">{stats.requested}</p>
              </Card>
              <Card className="text-center p-4 bg-blue-100">
                <CardTitle>In Progress</CardTitle>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
              </Card>
              {/* <Card className="text-center p-4 bg-green-50">
                <CardTitle>Completed</CardTitle>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </Card> */}
              <Card className="text-center p-4 bg-red-50">
                <CardTitle>Cancelled</CardTitle>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </Card>
            </div>

            {/* ✅ Breakdown Cards */}
            <div className="space-y-4">
              {filterBreakdowns(tab).length === 0 && <p>No breakdowns found.</p>}
              {filterBreakdowns(tab).map((item) => (
                <Card
                  key={item.id}
                  className="w-full shadow-lg rounded-2xl hover:shadow-xl transition"
                >
                  <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {item.registration || "N/A"}
                      </CardTitle>
                      <CardDescription>Order No: {item.order_no || "N/A"}</CardDescription>
                    </div>
                    <Badge className={statusColors[item.status] || "bg-gray-500 text-white"}>
                      {item.status || "N/A"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p><span className="font-semibold">Vehicle:</span> {item.make || "N/A"} {item.model || ""} ({item.year || "N/A"})</p>
                        <p><span className="font-semibold">Breakdown Type:</span> {item.breakdown_type || "N/A"}</p>
                        <p><span className="font-semibold">Fuel:</span> {item.fuel_type || "N/A"}</p>
                      </div>
                      <div>
                        <p><span className="font-semibold">Transmission:</span> {item.transmission_type || "N/A"}</p>
                        <p><span className="font-semibold">Color:</span> {item.colour || "N/A"}</p>
                        <p><span className="font-semibold">Client Type:</span> {item.client_type || "N/A"}</p>
                      </div>
                      <div>
                        {/* <p><span className="font-semibold">Reported At:</span> {new Date(item.reported_at).toLocaleString()}</p> */}
                        <p>Technicians Details</p>
                        <Separator className="my-2" />
                        <p className="font-semibold">Technician:</p>
                        {item.technicians ? (
                          <>
                            <p>{item.technicians.name}</p>
                            <p className="text-gray-500">{item.technicians.phone}</p>
                            {item.technicians.email && <p className="text-gray-500">{item.technicians.email}</p>}
                          </>
                        ) : (
                          <p>No technician assigned</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

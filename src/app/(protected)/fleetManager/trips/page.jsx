"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useGlobalContext } from "@/context/global-context/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import TripForm from "../../../../components/forms/trip-form";
import { initialTripsState } from "@/context/vehicles-context/context";
import { createClient } from "@/lib/supabase/client";

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const { initialTripsState } = useGlobalContext();
  const [trips, setTrips] = useState([]);
  const supabase = createClient();

  // Helper to parse JSON fields safely
  const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  // Get vehicles from context for lookup
  const vehiclesContext = useGlobalContext().vehicles?.data || [];

  // Helper to get driver names from vehicle assignments
  const getDriverNames = (trip) => {
    const assignments =
      parseJsonField(trip.vehicleAssignments) ||
      parseJsonField(trip.vehicle_assignments) ||
      [];
    return assignments
      .flatMap((va) => (va.drivers ? va.drivers.map((d) => d.name).filter(Boolean) : []))
      .join(", ");
  };

  // Helper to get vehicle names (make + model) from vehicle assignments
  const getVehicleNames = (trip) => {
    const assignments =
      parseJsonField(trip.vehicleAssignments) ||
      parseJsonField(trip.vehicle_assignments) ||
      [];
    return assignments
      .map((va) => {
        if (va.vehicle && va.vehicle.id) {
          const vehicleObj = vehiclesContext.find((v) => String(v.id) === String(va.vehicle.id));
          if (vehicleObj) {
            return `${vehicleObj.make || ""} ${vehicleObj.model || ""}`.trim();
          }
          return va.vehicle.name || "";
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Helper to display cost centre as name if object or JSON string
  const displayCostCentre = (val) => {
    if (!val) return "N/A";
    if (typeof val === "object" && val.name) return val.name;
    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      if (parsed && parsed.name) return parsed.name;
    } catch {}
    return String(val);
  };

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase.from('trips').select('*').neq('status', 'completed').neq('status', 'delivered');
      if (error) {
        console.error('Error fetching trips:', error);
      } else {
        // Parse JSON fields for each trip
        const parsedTrips = (data || []).map((trip) => ({
          ...trip,
          vehicleAssignments: parseJsonField(trip.vehicleAssignments) || parseJsonField(trip.vehicle_assignments) || [],
          driversDisplay: getDriverNames(trip),
          vehiclesDisplay: getVehicleNames(trip),
          costCentreDisplay: displayCostCentre(trip.costCentre || trip.cost_centre),
        }));
        setTrips(parsedTrips);
      }
    } catch (error) {
      console.error('Unexpected error fetching trips:', error);
    }
  };

  React.useEffect(() => {
    fetchTrips();
  }, []);
  // Use the state and columns from the context
  const {
    titleSection,
    screenStats,
    tableInfo,
    csv_headers,
    csv_rows,
  } = initialTripsState;

  const { columns } = initialTripsState;

  // Find the index for "Vehicles", "Drivers", and "Cost Centre" columns in the original columns
  const baseColumns = columns ? columns() : [];
  const vehiclesIdx = baseColumns.findIndex(
    (col) => col.accessorKey?.toLowerCase() === "vehicles"
  );
  const driversIdx = baseColumns.findIndex(
    (col) => col.accessorKey?.toLowerCase() === "drivers"
  );
  const costCentreIdx = baseColumns.findIndex(
    (col) => col.accessorKey?.toLowerCase() === "costcentre"
  );

  // Replace the Vehicles, Drivers, and Cost Centre columns with our computed ones
  const tableColumns = [...baseColumns];
  if (vehiclesIdx !== -1) {
    tableColumns[vehiclesIdx] = {
      ...tableColumns[vehiclesIdx],
      accessorKey: "vehiclesDisplay",
      header: "Vehicles",
      cell: ({ row }) => getVehicleNames(row.original) || "-",
    };
  }
  if (driversIdx !== -1) {
    tableColumns[driversIdx] = {
      ...tableColumns[driversIdx],
      accessorKey: "driversDisplay",
      header: "Drivers",
      cell: ({ row }) => getDriverNames(row.original) || "-",
    };
  }
  if (costCentreIdx !== -1) {
    tableColumns[costCentreIdx] = {
      ...tableColumns[costCentreIdx],
      accessorKey: "costCentreDisplay",
      header: "Cost Centre",
      cell: ({ row }) => row.original.costCentreDisplay || "-",
    };
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Title Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{titleSection?.title}</h1>
          <p className="text-gray-500">{titleSection?.description}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {titleSection.button.text}
        </button>
      </div>

      {/* Stats Section (This can be wired up to real data later) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {screenStats.map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border bg-white shadow-sm flex items-center space-x-4"
          >
            <div>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={tableInfo.tabs[0]?.value} className="w-full">
        <TabsList className="bg-blue-50 w-full">
          {tableInfo.tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tableInfo.tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} />
        ))}
      </Tabs>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Data Table */}
        <div className="p-4">
          {columns &&
            <DataTable
              columns={tableColumns}
              data={trips || []}
              filterColumn={[]}
              csv_headers={[]}
              csv_rows={[]}
              href="/fleetManager/trips"
              downloadCSV={() => {
                // a function to download csv
              }}
            />
          }
        </div>
      </div>

      {/* Trip Form Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto min-w-2/4">
          {/* Accessibility: Add DialogTitle and DialogDescription */}
          <div>
            <h2 className="text-lg font-semibold" id="trip-form-title">Trip Form</h2>
            <p className="text-sm text-muted-foreground" id="trip-form-desc">
              Fill in the trip details below.
            </p>
          </div>
          <TripForm onClose={() => setOpen(false)} id={undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

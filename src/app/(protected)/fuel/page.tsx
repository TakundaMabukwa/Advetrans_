"use client";

import FuelCanBusDisplay from "@/components/FuelCanBusDisplay";

export default function FuelPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Fuel Can Bus</h2>
        <p className="text-muted-foreground">Monitor fuel levels and consumption across your fleet</p>
      </div>
      
      <FuelCanBusDisplay />
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { initialStopPointsState } from "@/context/stop-points-context/context";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StopPointForm from "../../../../components/forms/stop-point-form";

export default function StopPointsPage() {
  const [open, setOpen] = useState(false);
  const {
    titleSection,
    screenStats,
    tableInfo,
    columns,
    data,
    csv_headers,
    csv_rows,
  } = initialStopPointsState;

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Title Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{titleSection.title}</h1>
          <p className="text-gray-500">{titleSection.description}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {titleSection.button.text}
        </button>
      </div>

      {/* Stats Section */}
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

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4">
          <DataTable
            columns={columns({
              onEdit: (stopPoint: any) =>
                console.log("Edit stop point:", stopPoint),
              onDelete: (stopPoint: any) =>
                console.log("Delete stop point:", stopPoint),
            })}
            data={data}
            filterColumn={tableInfo.filterColumn}
            csv_headers={csv_headers}
            csv_rows={csv_rows}
          />
        </div>
      </div>

      {/* Stop Point Form Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto min-w-2/4">
          <StopPointForm onCancel={() => setOpen(false)} id={undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

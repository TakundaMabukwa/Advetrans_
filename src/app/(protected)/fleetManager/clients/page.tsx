"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useGlobalContext } from "@/context/global-context/context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "../../../../components/forms/client-form";
import { DialogTitle } from "@radix-ui/react-dialog";
import { initialClientState } from "@/context/clients-context/context";
import { downloadCSVFromTable } from "@/lib/csv-parser";
import { createClient } from "@/lib/supabase/client";

export default function ClientsPage() {
  const [open, setOpen] = useState(false);
  const { columns, screenStats } = initialClientState;
  const [clients, setClients] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchClients = async () => {
      // Replace this with your actual data fetching logic
      const { data, error } = await supabase.from("clients").select("*");
      if (error) {
        console.error("Error fetching clients:", error);
      } else {
        setClients(data as any);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Title Section */}
      <div className="flex justify-between items-center">
        {/* <div>
          <h1 className="text-2xl font-bold">{titleSection.title}</h1>
          <p className="text-gray-500">{titleSection.description}</p>
        </div> */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {/* {titleSection.button.text} */}
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
            columns={columns()}
            data={clients || []}
            filterColumn={[]}
            filterPlaceholder={""}
            csv_headers={[]}
            csv_rows={[]}
            href={`/fleetManager/clients/`}
            downloadCSV={[]}
          />
        </div>
      </div>

      {/* Client Form Modal */}
      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogContent className="max-h-[90vh] overflow-y-auto min-w-2/4">
          <ClientForm onCancel={() => setOpen(false)} id={undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

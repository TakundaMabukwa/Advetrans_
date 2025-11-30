"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { printInspectionDetails } from "@/hooks/printPDF";

export default function InspectionDetail() {
  const params = useParams();
  const id = params?.id;
  const [inspection, setInspection] = useState<any>(null);
  const supabase = createClient();

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInspection = async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          `
          *,
          vehicle:vehicle_id (*),
          driver:driver_id (*)
        `
        )
        .eq("id", Number(id))
        .single();

      if (!error && data) {
        const checklist = (data as any)?.checklist;
        const parsed = {
          ...data,
          checklist: Array.isArray(checklist) ? checklist : [],
        };
        setInspection(parsed);
      }
    };
    if (id) fetchInspection();
  }, [id]);

  if (!inspection) return <div className="p-6">Loading inspection...</div>;

  const handleDownloadPdf = () => {
    if (!contentRef.current) return;
    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });
    doc.html(contentRef.current, {
      callback: function (doc) {
        doc.save(`Inspection_${inspection.id}.pdf`);
      },
      margin: [20, 20, 20, 20],
      autoPaging: "text",
      x: 0,
      y: 0,
      html2canvas: { scale: 0.6 }, // to improve quality
    });
  };

  // Print current contentRef as a new window
  const printContent = (htmlContent?: string) => {
    if (htmlContent) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else if (contentRef.current) {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button
          variant="link"
          className="text-indigo-600 hover:underline"
          onClick={() => window.history.back()}
        >
          &larr; Back to Inspections
        </Button>

        <Button
          onClick={() => printInspectionDetails(inspection)}
          className="mb-6 bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Download PDF
        </Button>

        <div ref={contentRef}>
          <h1 className="text-4xl font-extrabold text-gray-800 text-center drop-shadow-sm">
            Inspection #{inspection.id}
          </h1>

          {/* Vehicle Info */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-700">
                Vehicle Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <strong>Registration:</strong>{" "}
                {inspection.vehicle?.registration_number}
              </div>
              <div>
                <strong>Make/Model:</strong> {inspection.vehicle?.make}{" "}
                {inspection.vehicle?.model}
              </div>
              <div>
                <strong>VIN:</strong> {inspection.vehicle?.vin_number}
              </div>
              <div>
                <strong>Engine No:</strong> {inspection.vehicle?.engine_number}
              </div>
              <div>
                <strong>Colour:</strong> {inspection.vehicle?.colour}
              </div>
              <div>
                <strong>Year:</strong> {inspection.vehicle?.manufactured_year}
              </div>
            </CardContent>
          </Card>

          {/* Driver Info */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-700">
                Driver Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <strong>Name:</strong>{" "}
                {inspection.driver
                  ? `${inspection.driver.first_name} ${inspection.driver.surname}`
                  : "N/A"}
              </div>
              <div>
                <strong>License No:</strong> {inspection.driver?.license_number}
              </div>
              <div>
                <strong>License Expiry:</strong>{" "}
                {inspection.driver?.license_expiry_date}
              </div>
              <div>
                <strong>Cell:</strong> {inspection.driver?.cell_number}
              </div>
            </CardContent>
          </Card>

          {/* Inspection Details */}
          <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-700">
                Inspection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <strong>Odometer:</strong> {inspection.odo_reading}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                      inspection.overall_status === "Faulty"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {inspection.overall_status}
                  </span>
                </div>
                <div>
                  <strong>Category:</strong> {inspection.category}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(inspection.inspection_date).toLocaleString()}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-indigo-600 mb-3">
                  Checklist
                </h3>
                {Array.isArray(inspection.checklist) &&
                inspection.checklist.length > 0 ? (
                  inspection.checklist.map((section: any, sIdx: number) => (
                    <div key={sIdx} className="mb-6">
                      <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-1 mb-2">
                        {section.title}
                      </h4>
                      <ul className="list-disc list-inside space-y-2">
                        {section.items.map((item: any, iIdx: number) => (
                          <li key={iIdx} className="flex justify-between">
                            <span>
                              {item.label}{" "}
                              <span className="text-gray-500">
                                (Cat {item.category})
                              </span>
                            </span>
                            <span
                              className={
                                item.status === "Faulty"
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {item.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No checklist data available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

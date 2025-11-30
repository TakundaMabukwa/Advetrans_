"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InspectionTemplatesPage from "@/components/pages/InspectionTemplates";
import Link from "next/link";
import { SecureButton } from "@/components/SecureButton";

type InspectionItem = {
  label: string;
  category: string;
  status: string | null;
};

type InspectionSection = {
  title: string;
  items: InspectionItem[];
};

type Inspection = {
  id: number;
  vehicle_id: number;
  driver_id: number | null;
  odo_reading: number;
  overall_status: string | null;
  category: string | null;
  checklist: InspectionSection[] | null;
  inspection_date: string;
  vehicle: { registration_number: string; make: string; model: string } | null;
  driver: { first_name: string; surname: string } | null;
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Faulty" | "Passed">(
    "All"
  );
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // new state for templates modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchInspections = async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          `
          *,
          vehicle:vehicle_id (registration_number, make, model),
          driver:driver_id (first_name, surname)
        `
        )
        .order("inspection_date", { ascending: false });

      if (!error && data) setInspections(data as unknown as Inspection[]);
    };
    fetchInspections();
  }, []);

  // Derived filtered list
  const filteredInspections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return inspections.filter((insp) => {
      if (statusFilter !== "All") {
        // normalize possible "Passed" vs other naming
        const overall = (insp.overall_status || "").toLowerCase();
        if (statusFilter === "Faulty" && overall !== "faulty") return false;
        if (statusFilter === "Passed" && overall === "faulty") return false;
      }

      if (!term) return true;

      const vehicleMatch =
        insp.vehicle &&
        `${insp.vehicle.registration_number} ${insp.vehicle.make} ${insp.vehicle.model}`
          .toLowerCase()
          .includes(term);

      const driverMatch =
        insp.driver &&
        `${insp.driver.first_name} ${insp.driver.surname}`
          .toLowerCase()
          .includes(term);

      const categoryMatch = (insp.category || "").toLowerCase().includes(term);

      return Boolean(vehicleMatch || driverMatch || categoryMatch);
    });
  }, [inspections, searchTerm, statusFilter]);

  // Modal open/close handlers
  const openInspectionModal = (insp: Inspection) => {
    setSelectedInspection(insp);
    setIsModalOpen(true);
  };

  const closeInspectionModal = () => {
    setIsModalOpen(false);
    setSelectedInspection(null);
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isTemplateModalOpen) setIsTemplateModalOpen(false);
        if (isModalOpen) closeInspectionModal();
      }
    };
    if (isModalOpen || isTemplateModalOpen)
      window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, isTemplateModalOpen]);

  return (
    <div className="p-6 space-y-6">
      <div className="mx-auto">
        {/* Top hero / controls card */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-4 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                Vehicle Inspections
              </h1>
              <p className="mt-2 text-sm text-gray-600 max-w-prose">
                Below is a list of all vehicle inspections. Use search and
                filters to find inspections quickly. Click{" "}
                <span className="font-medium text-gray-800">
                  Manage Inspection
                </span>{" "}
                to open the inspection manager in a modal for details.
              </p>

              {/* Legend (compact) */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-full text-sm border border-red-100">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Faulty – Needs Attention
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Passed – No Issues
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3">
              <SecureButton
                page="inspections"
                action="create"
                onClick={() => setIsTemplateModalOpen(true)}
                variant="secondary"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow"
              >
                Inspection Template Manager
              </SecureButton>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
                variant="ghost"
                className="px-4 py-2"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Search & filter row */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by reg, make/model, driver or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "All" | "Faulty" | "Passed")
                }
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Faulty">Faulty</option>
                <option value="Passed">Passed</option>
              </select>
            </div>
          </div>
        </div>

        {/* compact area showing template quick actions (kept on page but primary manager is modal) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
          <div className="text-sm text-gray-600">
            <strong>Quick Template Actions:</strong> Horse · Trailer · + Add
            Section · Save Template
          </div>
          <div>
            <SecureButton
              page="inspections"
              action="create"
              onClick={() => setIsTemplateModalOpen(true)}
              variant="ghost"
              className="px-3 py-1 rounded-full border"
            >
              Open Template Manager
            </SecureButton>
          </div>
        </div>

        {/* Inspections list */}
        <div className="space-y-4">
          {filteredInspections.map((insp) => {
            const isFaulty = insp.overall_status === "Faulty";

            return (
              <Card
                key={insp.id}
                className={`transition transform hover:scale-[1.01] shadow-lg rounded-2xl border
          ${
            isFaulty
              ? "bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white"
              : "bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white"
          }
        `}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg font-semibold">
                    <span className="tracking-wide">
                      {insp.vehicle?.registration_number} – {insp.vehicle?.make}{" "}
                      {insp.vehicle?.model}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs uppercase shadow-sm
                ${
                  isFaulty
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/20 text-white border border-white/30"
                }
              `}
                    >
                      {insp.overall_status}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <strong>Driver:</strong>{" "}
                      {insp.driver
                        ? `${insp.driver.first_name} ${insp.driver.surname}`
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Odometer:</strong> {insp.odo_reading}
                    </div>
                    <div>
                      <strong>Category:</strong> {insp.category}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(insp.inspection_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Accordion */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`insp-${insp.id}`}>
                      <AccordionTrigger className="text-white hover:text-gray-100 rounded-3xl px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30">
                        Preview Checklist
                      </AccordionTrigger>
                      <AccordionContent className="bg-white/10 rounded-lg p-4">
                        {Array.isArray(insp.checklist) &&
                        insp.checklist.length > 0 ? (
                          insp.checklist.slice(0, 1).map((section, sIdx) => (
                            <div
                              key={sIdx}
                              className="mb-4 bg-white p-3 rounded text-black"
                            >
                              <h3 className="font-medium text-blue-700 mb-2">
                                {section.title}
                              </h3>
                              <ul className="list-disc list-inside space-y-1">
                                {section.items.map((item, iIdx) => (
                                  <li
                                    key={iIdx}
                                    className="flex justify-between text-sm"
                                  >
                                    <span>
                                      {item.label}{" "}
                                      <span className="text-gray-500">
                                        (Category : {item.category})
                                      </span>
                                    </span>
                                    <span
                                      className={
                                        item.status === "Faulty"
                                          ? "text-red-500 font-semibold"
                                          : "text-green-500 font-semibold"
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
                          <p className="text-sm text-gray-200 italic">
                            No checklist data available.
                          </p>
                        )}

                        <div className="mt-3 flex gap-2">
                          <SecureButton
                            page="inspections"
                            action="edit"
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                            onClick={() => openInspectionModal(insp)}
                          >
                            Manage Inspection
                          </SecureButton>
                          <Link href={`/fleetManager/inspections/${insp.id}`}>
                            <Button
                              variant="secondary"
                              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                            >
                              View Full Inspection
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}

          {filteredInspections.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No inspections found.
            </div>
          )}
        </div>
      </div>

      {/* Inspection Manager Modal */}
      {isModalOpen && selectedInspection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeInspectionModal}
          />
          <div className="relative z-10 max-w-3xl w-full mx-4 bg-white rounded-lg shadow-xl overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">
                Inspection Manager —{" "}
                {selectedInspection.vehicle?.registration_number ||
                  `#${selectedInspection.id}`}
              </h3>
              <div className="flex items-center gap-2">
                <Button onClick={closeInspectionModal} variant="secondary">
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <strong>Vehicle:</strong>{" "}
                  {selectedInspection.vehicle
                    ? `${selectedInspection.vehicle.registration_number} — ${selectedInspection.vehicle.make} ${selectedInspection.vehicle.model}`
                    : "N/A"}
                </div>
                <div>
                  <strong>Driver:</strong>{" "}
                  {selectedInspection.driver
                    ? `${selectedInspection.driver.first_name} ${selectedInspection.driver.surname}`
                    : "N/A"}
                </div>
                <div>
                  <strong>Odometer:</strong> {selectedInspection.odo_reading}
                </div>
                <div>
                  <strong>Category:</strong>{" "}
                  {selectedInspection.category || "N/A"}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    selectedInspection.inspection_date
                  ).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {selectedInspection.overall_status || "N/A"}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Full Checklist</h4>
                {Array.isArray(selectedInspection.checklist) &&
                selectedInspection.checklist.length > 0 ? (
                  selectedInspection.checklist.map((section, sIdx) => (
                    <div key={sIdx} className="mb-4 p-3 border rounded">
                      <h5 className="font-semibold mb-2">{section.title}</h5>
                      <ul className="space-y-2">
                        {section.items.map((item, iIdx) => (
                          <li
                            key={iIdx}
                            className="flex justify-between items-start gap-4"
                          >
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-gray-500">
                                Category: {item.category}
                              </div>
                            </div>
                            <div
                              className={
                                item.status === "Faulty"
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {item.status || "N/A"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm italic text-gray-500">
                    No checklist data available for this inspection.
                  </p>
                )}
              </div>

              {/* Placeholder area for manager actions (edit, mark resolved, etc.) */}
              <div className="pt-2 border-t flex justify-end gap-2">
                <SecureButton
                  page="inspections"
                  action="edit"
                  variant="ghost"
                  onClick={() => {
                    // placeholder: hook up real update logic
                    alert("Edit/Manage actions should be implemented here.");
                  }}
                >
                  Edit (placeholder)
                </SecureButton>
                <SecureButton
                  page="inspections"
                  action="edit"
                  onClick={() => {
                    // placeholder: example action
                    alert("Marking as resolved would call backend.");
                  }}
                >
                  Mark Resolved (placeholder)
                </SecureButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Template Manager Modal */}
      {isTemplateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsTemplateModalOpen(false)}
          />
          <div className="relative z-10 max-w-4xl w-full mx-4 bg-white rounded-lg shadow-xl overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">
                Inspection Template Manager
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsTemplateModalOpen(false)}
                  variant="secondary"
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4">
              {/* Render the existing InspectionTemplatesPage component inside modal */}
              <InspectionTemplatesPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

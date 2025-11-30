"use client"

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InspectionEditor from "@/components/pages/InspectionEditor";

export default function InspectionTemplatesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inspection Template Manager</h1>
      <Tabs defaultValue="horse" className="w-full">
        <TabsList>
          <TabsTrigger value="horse">Horse</TabsTrigger>
          <TabsTrigger value="trailer">Trailer</TabsTrigger>
        </TabsList>
        <TabsContent value="horse">
          <InspectionEditor type="horse" />
        </TabsContent>
        <TabsContent value="trailer">
          <InspectionEditor type="trailer" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

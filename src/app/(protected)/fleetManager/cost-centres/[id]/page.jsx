"use server";

// next
import { redirect } from "next/navigation";

// lib
import { createClient } from "@/lib/supabase/server";
// components
import React from "react";
import CostCentreDetails from "../../../../../components/detail-pages/cost-centre-screen";

// const TripDetailsPage = async ({ params }: TripDetailsPageProps) => {
const CostCentreDetailsPage = async ({ params }) => {
  const { id } = params;
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <CostCentreDetails id={id} />;
};

export default CostCentreDetailsPage;

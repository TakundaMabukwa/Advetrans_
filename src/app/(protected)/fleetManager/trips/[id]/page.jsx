"use server";

// next
import { redirect } from "next/navigation";

// lib
import { createClient } from "@/lib/supabase/server";
// components
import TripDetails from "@/components/detail-pages/trip-details";
import React from "react";

// interface TripDetailsPageProps {
//   params: { id: string };
// }

// const TripDetailsPage = async ({ params }: TripDetailsPageProps) => {
const TripDetailsPage = async ({ params }) => {
  const { id } = params;
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <TripDetails id={id} />;
};

export default TripDetailsPage;

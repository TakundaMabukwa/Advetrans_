"use server";

// next
import { redirect } from "next/navigation";

// lib
import { createClient } from "@/lib/supabase/server";
// components
import React from "react";
import ClientDetails from "../../../../../components/detail-pages/client-details";
const ClientDetailsPage = async ({ params }) => {
  const { id } = params;
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ClientDetails id={id} />;
};

export default ClientDetailsPage;

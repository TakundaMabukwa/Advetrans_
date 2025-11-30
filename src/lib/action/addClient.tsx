'use server'

import { createClient } from "@/lib/supabase/server";

export type ExternalClient = {
  validated: string;
  id?: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  clienttype?: string;
  status?: string;
  rating?: number;
  total_jobs?: number;
  total_revenue?: number;
  average_job_value?: number;
  payment_terms?: string;
  credit_limit?: number;
  registration_date?: string;
  last_job_date?: string;
  preferred_services?: string[];
  contract_type?: string;
  accountmanager?: string;
  specialties?: string[];
  service_areas?: string[];
  availability?: boolean;
  client_type: string;
  vehicle_types?: string[];
};

export interface Subcontractor {
  id?: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  specialties?: string[];
  service_areas?: string[];
  rating?: number;
  completed_jobs?: number;
  response_time?: number;
  hourly_rate: number;
  availability?: boolean;
  certifications?: string[];
  equipment_types?: string[];
  contract_status?: "active" | "pending" | "suspended";
  last_active?: string;
  contract_type?: string;
  accountmanager?: string;
  client_type: "subcontractor";
}

export interface TowingCompany {
  id?: number;
  company_name: string;
  contact_person: string;
  phone: string;
  emergency_phone: string;
  email: string;
  service_areas?: string[];
  vehicle_types?: string[];
  capacity?: {
    lightVehicles: number;
    heavyVehicles: number;
    specializedEquipment: number;
  };
  rates?: {
    perKm: number;
    baseRate: number;
    emergencyRate: number;
  };
  rating?: number;
  response_time?: number;
  availability?: boolean;
  status?: "active" | "inactive";
  last_used?: string;
  contract_type?: string;
  accountmanager?: string;
  client_type: "towing";
}

export async function addExternalClient(client: ExternalClient) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from('clients').insert([
      { ...client }
    ]);
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function addSubcontractor(sub: Subcontractor) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from('clients').insert([
      { ...sub }
    ]);
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function addTowingCompany(company: TowingCompany) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from('clients').insert([
      { ...company }
    ]);
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

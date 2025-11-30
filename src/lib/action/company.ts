"use server"

import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto"


interface Company {
    name: string,
    email: string,
    phone: string,
    contactname: string,
    size: Number,
    infor: string,
    industry: string,
    website: string | null,
    company_size: number,
    tax_id: string,
    address: {
        city: string,
        country: string,
        province: string,
        zip: number,
        street: string
    },
    no_vehicles: number,
    v_type: string,
    regions: string,
    fms: string,
    user: {
        name: string,
        surname: string,
        email: string,
        phone: string,
        role: 'fleet manager',
        call_center: string,
    }

}

interface Admin {

}


// export async function RegisterCompany(formData: FormData) {
//     console.log("Register Company")
//     const supabase = await createClient();
//     const { data, error } = await supabase.from('companies').insert({
//         name: "Test Company",
//         address: "123 Main St",
//         city: "Anytown",
//         state: "CA",
//         zip: "12345",
//     })

//     const manager = {
//         email: formData.get("email") as string,
//         password: formData.get("password") as string,
//         options: {
//             data: {
//                 name: fullName,
//                 phone,
//                 role: role,
//             },
//         },
//     };

//     const { data: newUser, error: errors } = await supabase.auth.signUp(manager)
// }

/**
 * Insert a new company into the public.company table
 * @param companyData - Object containing company registration fields
 * @returns Supabase insert result
 */
export async function insertCompany(companyData: {
  company_name: string,
  company_contact: string,
  company_email: string,
  company_phone: string,
  company_contactname: string,
  company_size: number,
  company_infor?: string,
  company_industry: string,
  company_website?: string,
  company_tax_id?: string,
  company_no_vehicles: number,
  company_v_type: string,
  company_regions?: string,
  company_fms?: string,
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('company').insert([
    {
      company_name: companyData.company_name,
      company_contact: companyData.company_contact,
      company_email: companyData.company_email,
      company_phone: companyData.company_phone,
      company_contactname: companyData.company_contactname,
      company_size: companyData.company_size,
      company_infor: companyData.company_infor || null,
      company_industry: companyData.company_industry,
      company_website: companyData.company_website || null,
      company_tax_id: companyData.company_tax_id || null,
      company_no_vehicles: companyData.company_no_vehicles,
      company_v_type: companyData.company_v_type,
      company_regions: companyData.company_regions || null,
      company_fms: companyData.company_fms || null,
    }
  ]);
  return { data, error };
}

/**
 * Register a company and its admin user in Supabase Auth
 * @param companyData - Company registration fields
 * @param adminData - Admin user fields
 * @returns Supabase insert result and admin credentials
 */
export async function registerCompanyWithAdmin(companyData: {
  company_name: string,
  company_contact: string,
  company_email: string,
  company_phone: string,
  company_contactname: string,
  company_size: number,
  company_infor?: string,
  company_industry: string,
  company_website?: string,
  company_tax_id?: string,
  company_no_vehicles: number,
  company_v_type: string,
  company_regions?: string,
  company_fms?: string,
}, adminData: {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  role: string,
}) {
  const supabase = await createClient();
  // Generate a random password (10 chars)
  const tempPassword = randomBytes(8).toString("base64").slice(0, 10);

  // Create admin user in Supabase Auth
  const { data: user, error: userError } = await supabase.auth.signUp({
    email: adminData.email,
    password: tempPassword,
    options: {
      data: {
        name: adminData.firstName + " " + adminData.lastName,
        phone: adminData.phone,
        role: adminData.role || "fleet manager",
      },
    },
  });

  if (userError) {
    return { error: userError.message };
  }

  // Insert company, linking created_by to admin user id
  const { data, error } = await supabase.from("company").insert([
    {
      ...companyData,
      created_by: user.user?.id,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  return {
    data,
    admin: {
      email: adminData.email,
      tempPassword,
    },
  };
}


// export function addUser() {

// }



"use server"


// import { createClient } from "../supabase/server";

//     const supabase = createClient()
// export async function getVehicleByRegistrationNumber(registrationNumber: string) {
//     if (!registrationNumber) {
//         console.error("Registration number is required");
//         return null;

//     }
//     const { data, error } = await supabase
//         .from('vehiclesc')
//         .select()
//         .eq("registration_number", registrationNumber)
//         .single();


//     if (error) {
//         console.error("Error fetching vehicle by registration number:", error);
//         return null;
//     }
//     return data;
// }
"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "../supabase/database.types"


interface Technician {
    id: number | null
    name: string
    phone: string
    email: string
    location: string
    coordinates: { lat: number; lng: number }
    availability: "available" | "busy" | "off-duty" | "emergency"
    specialties: string[]
    skillLevels: {
        electrical: number
        mechanical: number
        hydraulic: number
        diagnostic: number
    }
    rating: number
    // completedJobs: number
    // responseTime: string
    job_allocation?: number
    joinDate: string
    certifications: string[]
    vehicleType: string
    equipmentLevel: "basic" | "advanced" | "specialist",
    type: "external" | "internal",
    created_by: '',
    workshop_id: '',

}

interface JobAssignment {
    id: number
    job_id: string
    description: string
    location: string
    priority: "low" | "medium" | "high" | "emergency"
    status: Database["public"]["Tables"]["job_assignments"]["Row"]["status"][]
    accepted: boolean
    technician_id?: number
    created_at: string
    updated_at?: string
}
export async function assignJob(Jobassignment: JobAssignment, technician_id: number) {
    const supabase = await createClient();

    // 1️⃣ Update job: assign technician
    const { data: jobUpdate, error: jobError } = await supabase
        .from("job_assignments")
        .update({
            technician_id: technician_id,
            status: "Breakdown assigned ",
            accepted: true,
        })
        .eq("id", Jobassignment.id)
        .select("id, technician_id, status");

    if (jobError) {
        return { error: jobError.message };
    }

    // 2️⃣ Update technician: attach job + set availability
    const { data: techUpdate, error: techError } = await supabase
        .from("technicians")
        .update({
            job_allocation: Jobassignment.id,
            availability: "busy",
        })
        .eq("id", technician_id)
        .select("id, job_allocation, availability");

    if (techError) {
        return { error: techError.message };
    }
    return { Jobassignment: Jobassignment.id, technician_id: technician_id };
}



export async function assignTechnicianToJob({
    jobId,
    technicianId,
}: {
    jobId: number
    technicianId: string
}) {
    const supabase = await createClient()

    // Step 1: Assign technician to the job
    const { data: jobUpdateData, error: jobError } = await supabase
        .from('job_assignments')
        .update({
            technician_id: Number(technicianId),
            status: 'Breakdown assigned',
        })
        .eq('id', jobId)
        .select('id, technician_id, status')

    if (jobError) {
        console.error('❌ Failed to assign technician to job:', jobError)
        return { success: false, error: jobError.message }
    }

    // Step 2: Update technician status
    const { data: technicianUpdateData, error: techError } = await supabase
        .from('technicians')
        .update({ availability: 'busy' })
        .eq('id', Number(technicianId))
        .select('id, availability')

    if (techError) {
        console.error('❌ Failed to update technician status:', techError)
        return { success: false, error: techError.message }
    }

    console.log('✅ Technician successfully assigned and marked busy.')
    return {
        success: true,
        job: jobUpdateData[0],
        technician: technicianUpdateData[0],
    }
}


export async function addTechnician(technician: Technician) {
    const supabase = await createClient()
    const { data: userSession, error: errorSession } = await supabase.auth.getUser()
    const userId = userSession.user?.id;
    if (!userId) {
        return;
    }
    const { data, error } = await supabase
        .from('technicians')
        .insert({
            name: technician.name,
            phone: technician.phone,
            email: technician.email,
            location: technician.location,
            coordinates: technician.coordinates,
            availability: technician.availability,
            specialties: technician.specialties,
            skill_levels: technician.skillLevels,
            rating: technician.rating,
            join_date: technician.joinDate,
            certifications: technician.certifications,
            vehicle_type: technician.vehicleType,
            equipment_level: technician.equipmentLevel,
            type: technician.type,
            created_by: userId,
            workshop_id: undefined,
        })
        .select()

    if (error) {
        console.error('Failed to add technician:', error)
        return { success: false, error: error.message }
    }
    return { success: true, technician: data[0] }
}




export async function ExternaladdTechnician(technician: Technician) {
    const supabase = await createClient()
    const { data: userSession, error: errorSession } = await supabase.auth.getUser()
    const userId = userSession.user?.id;
    if (!userId) {
        return;
    }
    const { data: workshop } = await supabase.from("profiles").select('workshop_id').eq('id', userId).single()
    if (!workshop) {
        return
    }
    const workId = workshop.workshop_id;
    const { data, error } = await supabase
        .from('technicians')
        .insert({
            name: technician.name,
            phone: technician.phone,
            email: technician.email,
            location: technician.location,
            coordinates: technician.coordinates,
            availability: technician.availability,
            specialties: technician.specialties,
            skill_levels: technician.skillLevels,
            rating: technician.rating,
            join_date: technician.joinDate,
            certifications: technician.certifications,
            vehicle_type: technician.vehicleType,
            equipment_level: technician.equipmentLevel,
            type: technician.type,
            created_by: userId,
            workshop_id: workshop.workshop_id,
        })
        .select()

    if (error) {
        console.error('Failed to add technician:', error)
        return { success: false, error: error.message }
    }
    return { success: true, technician: data[0] }
}
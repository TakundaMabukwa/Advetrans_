'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface EpsDriver {
  id: string
  first_name: string
  surname: string
  code: string | null
  managed_code: string | null
  address: string | null
  cellular: string | null
  additional_info: string | null
}

export interface DriversResponse {
  drivers: EpsDriver[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getDrivers(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<DriversResponse> {
  try {
    const supabase = createClient(cookies())
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Build the query - only select specific columns
    let query = supabase
      .from('eps_drivers')
      .select('id, first_name, surname, code, managed_code, address, cellular, additional_info', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Add search filter if provided
    if (search && search.trim()) {
      query = query.or(`first_name.ilike.%${search}%,surname.ilike.%${search}%,code.ilike.%${search}%,managed_code.ilike.%${search}%,address.ilike.%${search}%,cellular.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching drivers:', error)
      throw new Error(`Failed to fetch drivers: ${error.message}`)
    }
    
    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    
    console.log(`📊 Fetched ${data?.length || 0} drivers (page ${page}/${totalPages}, total: ${total})`)
    
    return {
      drivers: data || [],
      total,
      page,
      limit,
      totalPages
    }
  } catch (error) {
    console.error('Error in getDrivers:', error)
    throw error
  }
}

export async function addDriver(driverData: Partial<EpsDriver>): Promise<{ success: boolean; message: string; driver?: EpsDriver }> {
  try {
    const supabase = createClient(cookies())
    
    // Validate required fields
    if (!driverData.surname) {
      return {
        success: false,
        message: 'Full name is required'
      }
    }
    
    const { data, error } = await supabase
      .from('eps_drivers')
      .insert([{
        first_name: '',
        surname: driverData.surname,
        code: driverData.code || null,
        managed_code: driverData.managed_code || null,
        address: driverData.address || null,
        cellular: driverData.cellular || null,
        additional_info: driverData.additional_info || null,
        is_active: true,
        driver_status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding driver:', error)
      return {
        success: false,
        message: `Failed to add driver: ${error.message}`
      }
    }
    
    console.log('✅ Driver added successfully:', data)
    
    return {
      success: true,
      message: 'Driver added successfully',
      driver: data
    }
  } catch (error) {
    console.error('Error in addDriver:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while adding the driver'
    }
  }
}

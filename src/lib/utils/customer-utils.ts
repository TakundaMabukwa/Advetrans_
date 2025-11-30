import { createClient } from '@/lib/supabase/client'

export interface Customer {
  id: number
  customer_id: string
  customer_name: string
  zone: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  restrictions: string[]
  created_at: string
  updated_at: string
}

export interface NewCustomerInfo {
  customer_id: string
  customer_name: string
}

/**
 * Check if customers exist in the customers table
 * Returns list of customers that need to be added
 */
export async function checkForNewCustomers(
  customerIds: string[]
): Promise<NewCustomerInfo[]> {
  const supabase = createClient()
  
  const { data: existingCustomers, error } = await supabase
    .from('customers')
    .select('customer_id')
    .in('customer_id', customerIds)

  if (error) {
    console.error('Error checking customers:', error)
    return []
  }

  const existingIds = new Set(existingCustomers?.map(c => c.customer_id) || [])
  
  return customerIds
    .filter(id => !existingIds.has(id))
    .map(id => ({ customer_id: id, customer_name: '' }))
}

/**
 * Get customer by customer_id
 */
export async function getCustomer(customerId: string): Promise<Customer | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return data
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: {
  customer_id: string
  customer_name: string
  zone: string
  address: string
  latitude: number
  longitude: number
  restrictions?: string[]
}): Promise<Customer | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      ...customerData,
      restrictions: customerData.restrictions || []
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    return null
  }

  return data
}

/**
 * Update customer information
 */
export async function updateCustomer(
  customerId: string,
  updates: Partial<Omit<Customer, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>
): Promise<Customer | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    return null
  }

  return data
}

/**
 * Get all customers
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('customer_name')

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data || []
}

/**
 * Get customers by zone
 */
export async function getCustomersByZone(zone: string): Promise<Customer[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('zone', zone)
    .order('customer_name')

  if (error) {
    console.error('Error fetching customers by zone:', error)
    return []
  }

  return data || []
}

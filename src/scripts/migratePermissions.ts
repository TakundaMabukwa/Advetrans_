// Run this once to populate existing users with permissions
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions/permissions'

export async function migrateUserPermissions() {
  const supabase = createClient()
  
  const { data: users } = await supabase
    .from('users')
    .select('id, email, role, permissions')
    .is('permissions', null) // Only users without permissions
  
  if (!users) return
  
  for (const user of users) {
    const permissions = user.email === 'admin@eps.com' 
      ? DEFAULT_ROLE_PERMISSIONS.admin 
      : DEFAULT_ROLE_PERMISSIONS[user.role] || []
    
    await supabase
      .from('users')
      .update({ permissions })
      .eq('id', user.id)
  }
  
  console.log(`Updated ${users.length} users with permissions`)
}
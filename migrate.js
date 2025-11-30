require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    { page: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'fleetJobs', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'loadPlan', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'fuel', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'drivers', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'vehicles', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'costCenters', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'financials', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'inspections', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'userManagement', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'systemSettings', actions: ['view', 'create', 'edit', 'delete'] }
  ],
  'fleet manager': [
    { page: 'dashboard', actions: ['view', 'create', 'edit'] },
    { page: 'fleetJobs', actions: ['view', 'create', 'edit'] },
    { page: 'drivers', actions: ['view', 'create', 'edit'] },
    { page: 'vehicles', actions: ['view', 'create', 'edit'] },
    { page: 'inspections', actions: ['view', 'create', 'edit'] },
    { page: 'fuel', actions: ['view', 'create', 'edit'] },
    { page: 'financials', actions: ['view'] },
    { page: 'systemSettings', actions: ['view'] }
  ],
  fc: [
    { page: 'dashboard', actions: ['view'] },
    { page: 'loadPlan', actions: ['view'] }
  ],
  customer: [
    { page: 'drivers', actions: ['view'] },
    { page: 'vehicles', actions: ['view'] },
    { page: 'inspections', actions: ['view'] },
    { page: 'fuel', actions: ['view'] },
    { page: 'financials', actions: ['view'] }
  ]
}

async function migrateUserPermissions() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, permissions')
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  if (!users) {
    console.log('No users found')
    return
  }
  
  console.log(`Found ${users.length} users`)
  
  for (const user of users) {
    const permissions = user.email === 'admin@eps.com' 
      ? DEFAULT_ROLE_PERMISSIONS.admin 
      : DEFAULT_ROLE_PERMISSIONS[user.role] || []
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', user.id)
    
    if (updateError) {
      console.error(`Error updating user ${user.email}:`, updateError)
    } else {
      console.log(`Updated ${user.email} with ${permissions.length} permissions`)
    }
  }
  
  console.log('Migration completed!')
}

migrateUserPermissions().catch(console.error)
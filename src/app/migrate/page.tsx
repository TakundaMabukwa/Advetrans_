"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { migrateUserPermissions } from '@/scripts/migratePermissions'

export default function MigratePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMigrate = async () => {
    setLoading(true)
    setStatus('Migrating...')
    
    try {
      await migrateUserPermissions()
      setStatus('Migration completed successfully!')
    } catch (error) {
      setStatus('Migration failed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Migrate User Permissions</h1>
      <p className="mb-4">This will populate existing users with default permissions based on their roles.</p>
      
      <Button onClick={handleMigrate} disabled={loading}>
        {loading ? 'Migrating...' : 'Run Migration'}
      </Button>
      
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          {status}
        </div>
      )}
    </div>
  )
}
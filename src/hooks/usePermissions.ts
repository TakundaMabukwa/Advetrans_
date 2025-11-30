"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Permission, hasPermission, getPagePermissions, PageKey, ActionKey } from '@/lib/permissions/permissions'

// Global cache for permissions
let globalPermissions: Permission[] = []
let globalUserEmail: string = ''
let permissionsLoaded = false

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>(globalPermissions)
  const [userEmail, setUserEmail] = useState<string>(globalUserEmail)

  useEffect(() => {
    if (permissionsLoaded) {
      setPermissions(globalPermissions)
      setUserEmail(globalUserEmail)
      return
    }

    async function fetchUserPermissions() {
      try {
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user?.email) {
          permissionsLoaded = true
          return
        }

        globalUserEmail = user.email
        setUserEmail(user.email)

        const { data: userData, error } = await supabase
          .from('users')
          .select('permissions')
          .eq('email', user.email)
          .single()

        if (userData?.permissions) {
          globalPermissions = userData.permissions
          setPermissions(userData.permissions)
        }
      } catch (error) {
        // Silent error handling
      } finally {
        permissionsLoaded = true
      }
    }

    fetchUserPermissions()
  }, [])

  const canAccess = (page: PageKey, action: ActionKey = 'view') => {
    // Special case for admin@eps.com - full access
    if (globalUserEmail === 'admin@eps.com') {
      return true
    }
    return hasPermission(globalPermissions, page, action)
  }

  const getActions = (page: PageKey) => {
    // Special case for admin@eps.com - all actions
    if (globalUserEmail === 'admin@eps.com') {
      return ['view', 'create', 'edit', 'delete'] as ActionKey[]
    }
    return getPagePermissions(globalPermissions, page)
  }

  return {
    permissions: globalPermissions,
    canAccess,
    getActions,
    userEmail: globalUserEmail
  }
}
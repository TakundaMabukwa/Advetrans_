"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PAGES, ACTIONS, Permission, PageKey, ActionKey } from '@/lib/permissions/permissions'

interface PermissionSelectorProps {
  permissions: Permission[]
  onChange: (permissions: Permission[]) => void
}

export function PermissionSelector({ permissions, onChange }: PermissionSelectorProps) {
  const handlePageActionChange = (page: PageKey, action: ActionKey, checked: boolean) => {
    const newPermissions = [...permissions]
    const pageIndex = newPermissions.findIndex(p => p.page === page)
    
    if (pageIndex === -1) {
      if (checked) {
        newPermissions.push({ page, actions: [action] })
      }
    } else {
      const pagePermission = newPermissions[pageIndex]
      if (checked) {
        if (!pagePermission.actions.includes(action)) {
          pagePermission.actions.push(action)
        }
      } else {
        pagePermission.actions = pagePermission.actions.filter(a => a !== action)
        if (pagePermission.actions.length === 0) {
          newPermissions.splice(pageIndex, 1)
        }
      }
    }
    
    onChange(newPermissions)
  }

  const isActionChecked = (page: PageKey, action: ActionKey): boolean => {
    const pagePermission = permissions.find(p => p.page === page)
    return pagePermission?.actions.includes(action) || false
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {Object.entries(PAGES).map(([pageKey, pageInfo]) => (
        <Card key={pageKey} className="p-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{pageInfo.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4">
              {Object.entries(ACTIONS).map(([actionKey, actionLabel]) => (
                <label key={actionKey} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={isActionChecked(pageKey as PageKey, actionKey as ActionKey)}
                    onCheckedChange={(checked) => 
                      handlePageActionChange(pageKey as PageKey, actionKey as ActionKey, checked as boolean)
                    }
                  />
                  <span className="text-sm">{actionLabel}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PAGES, ACTIONS, Permission, PageKey, ActionKey } from '@/lib/permissions/permissions'

interface PagePermissionSelectorProps {
  permissions: Permission[]
  onChange: (permissions: Permission[]) => void
  onNext: () => void
  onBack: () => void
  currentStep: 'pages' | 'permissions'
}

export function PagePermissionSelector({ permissions, onChange, onNext, onBack, currentStep }: PagePermissionSelectorProps) {
  const selectedPages = permissions.map(p => p.page)
  
  const handlePageToggle = (page: PageKey, checked: boolean) => {
    const newPermissions = [...permissions]
    const pageIndex = newPermissions.findIndex(p => p.page === page)
    
    if (checked && pageIndex === -1) {
      newPermissions.push({ page, actions: ['view'] })
    } else if (!checked && pageIndex !== -1) {
      newPermissions.splice(pageIndex, 1)
    }
    
    onChange(newPermissions)
  }

  const handleActionToggle = (page: PageKey, action: ActionKey, checked: boolean) => {
    const newPermissions = [...permissions]
    const pageIndex = newPermissions.findIndex(p => p.page === page)
    
    if (pageIndex !== -1) {
      const pagePermission = newPermissions[pageIndex]
      if (checked) {
        if (!pagePermission.actions.includes(action)) {
          pagePermission.actions.push(action)
        }
      } else {
        pagePermission.actions = pagePermission.actions.filter(a => a !== action)
        // Keep at least view permission
        if (pagePermission.actions.length === 0) {
          pagePermission.actions = ['view']
        }
      }
    }
    
    onChange(newPermissions)
  }

  const isPageSelected = (page: PageKey): boolean => {
    return selectedPages.includes(page)
  }

  const isActionChecked = (page: PageKey, action: ActionKey): boolean => {
    const pagePermission = permissions.find(p => p.page === page)
    return pagePermission?.actions.includes(action) || false
  }

  return (
    <Tabs value={currentStep} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pages">Select Pages</TabsTrigger>
        <TabsTrigger value="permissions" disabled={selectedPages.length === 0}>Set Permissions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pages" className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Select which pages this user can access:
        </div>
        <div className="grid gap-3">
          {Object.entries(PAGES).map(([pageKey, pageInfo]) => (
            <label key={pageKey} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Checkbox
                checked={isPageSelected(pageKey as PageKey)}
                onCheckedChange={(checked) => 
                  handlePageToggle(pageKey as PageKey, checked as boolean)
                }
              />
              <span className="font-medium">{pageInfo.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={selectedPages.length === 0}
          >
            Next: Set Permissions
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="permissions" className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Set specific permissions for each selected page:
        </div>
        <div className="space-y-4">
          {permissions.map(({ page }) => (
            <div key={page} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">{PAGES[page].name}</h4>
              <div className="flex gap-4">
                {Object.entries(ACTIONS).map(([actionKey, actionLabel]) => (
                  <label key={actionKey} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={isActionChecked(page, actionKey as ActionKey)}
                      onCheckedChange={(checked) => 
                        handleActionToggle(page, actionKey as ActionKey, checked as boolean)
                      }
                      disabled={actionKey === 'view'} // View is always required
                    />
                    <span className="text-sm">{actionLabel}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back: Select Pages
          </Button>
          <Button type="submit">
            Create User
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
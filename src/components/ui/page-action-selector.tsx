"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PAGES, ACTIONS, PageKey, ActionKey } from '@/lib/permissions/permissions'
import { ChevronDown, ChevronRight, Eye, Plus, Edit, Trash2 } from 'lucide-react'

interface PageActionSelectorProps {
  initialPermissions?: { page: PageKey; actions: ActionKey[] }[]
  onChange?: (permissions: { page: PageKey; actions: ActionKey[] }[]) => void
  readOnly?: boolean
}

const ACTION_ICONS = {
  view: Eye,
  create: Plus,
  edit: Edit,
  delete: Trash2
}

const ACTION_COLORS = {
  view: 'bg-blue-100 text-blue-800',
  create: 'bg-green-100 text-green-800',
  edit: 'bg-yellow-100 text-yellow-800',
  delete: 'bg-red-100 text-red-800'
}

const ACTION_DESCRIPTIONS = {
  view: 'Allow user to see and read data on this page',
  create: 'Allow user to add new records or items',
  edit: 'Allow user to modify existing records',
  delete: 'Allow user to remove records permanently'
}

export function PageActionSelector({ initialPermissions = [], onChange, readOnly = false }: PageActionSelectorProps) {
  const [permissions, setPermissions] = useState(initialPermissions)
  const [expandedPages, setExpandedPages] = useState<Set<PageKey>>(new Set())

  useEffect(() => {
    setPermissions(initialPermissions)
  }, [initialPermissions])

  const togglePageExpansion = (page: PageKey) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(page)) {
      newExpanded.delete(page)
    } else {
      newExpanded.add(page)
    }
    setExpandedPages(newExpanded)
  }

  const getPagePermissions = (page: PageKey) => {
    return permissions.find(p => p.page === page)?.actions || []
  }

  const updatePagePermissions = (page: PageKey, actions: ActionKey[]) => {
    if (readOnly) return
    const newPermissions = permissions.filter(p => p.page !== page)
    if (actions.length > 0) {
      newPermissions.push({ page, actions })
    }
    setPermissions(newPermissions)
    onChange?.(newPermissions)
  }

  const toggleAction = (page: PageKey, action: ActionKey) => {
    if (readOnly) return
    const currentActions = getPagePermissions(page)
    const newActions = currentActions.includes(action)
      ? currentActions.filter(a => a !== action)
      : [...currentActions, action]
    updatePagePermissions(page, newActions)
  }

  const toggleAllActions = (page: PageKey) => {
    if (readOnly) return
    const currentActions = getPagePermissions(page)
    const allActions = Object.keys(ACTIONS) as ActionKey[]
    const hasAll = allActions.every(action => currentActions.includes(action))
    updatePagePermissions(page, hasAll ? [] : allActions)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Select pages and specific actions the user can perform. Hover over items for more details.
        </div>
      
      {Object.entries(PAGES).map(([pageKey, pageInfo]) => {
        const page = pageKey as PageKey
        const pagePermissions = getPagePermissions(page)
        const isExpanded = expandedPages.has(page)
        const hasAnyPermissions = pagePermissions.length > 0
        
        return (
          <Card key={page} className={`transition-all ${hasAnyPermissions ? 'ring-2 ring-blue-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePageExpansion(page)}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-base cursor-help">{pageInfo.name}</CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{pageInfo.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Badge variant="outline" className="text-xs">
                    {pagePermissions.length} actions
                  </Badge>
                </div>
                {!readOnly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={readOnly ? undefined : () => toggleAllActions(page)}
                        className="text-xs"
                      >
                        {pagePermissions.length === 4 ? 'Remove All' : 'Grant All'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {pagePermissions.length === 4 
                          ? 'Remove all permissions for this page' 
                          : 'Grant all permissions (View, Create, Edit, Delete) for this page'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {pagePermissions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {pagePermissions.map(action => {
                    const Icon = ACTION_ICONS[action]
                    return (
                      <Badge key={action} className={`${ACTION_COLORS[action]} text-xs`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {ACTIONS[action]}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ACTIONS).map(([actionKey, actionName]) => {
                    const action = actionKey as ActionKey
                    const isChecked = pagePermissions.includes(action)
                    const Icon = ACTION_ICONS[action]
                    
                    return (
                      <Tooltip key={action}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                              isChecked ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                            } ${!readOnly ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
                            onClick={readOnly ? undefined : () => toggleAction(page, action)}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => {}}
                            />
                            <Icon className={`h-4 w-4 ${isChecked ? 'text-blue-600' : 'text-gray-500'}`} />
                            <span className={`text-sm font-medium ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>
                              {actionName}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ACTION_DESCRIPTIONS[action]}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600">
                    <strong>Action Descriptions:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• <strong>View:</strong> See page content and data</li>
                      <li>• <strong>Create:</strong> Add new records or items</li>
                      <li>• <strong>Edit:</strong> Modify existing records</li>
                      <li>• <strong>Delete:</strong> Remove records permanently</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
      </div>
    </TooltipProvider>
  )
}
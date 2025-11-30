"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const VEHICLE_TYPES = [
  'TAUTLINER',
  'TAUT X-BRDER - BOTSWANA',
  'TAUT X-BRDER - NAMIBIA', 
  'CITRUS LOAD (+1 DAY STANDING FPT)',
  '14M/15M COMBO (NEW)',
  '14M/15M REEFER',
  '9 METER (NEW)',
  '8T JHB (NEW - EPS)',
  '8T JHB (NEW) - X-BRDER - MOZ',
  '8T JHB (OLD)',
  '14 TON CURTAIN',
  '1TON BAKKIE'
]

export function VehicleTypeDropdown({ 
  value, 
  onChange, 
  placeholder = "Select vehicle type"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const filteredTypes = VEHICLE_TYPES.filter(type =>
    type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (type) => {
    onChange(type)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{value || placeholder}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md max-h-80">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={searchInputRef}
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredTypes.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchTerm ? 'No vehicle types match your search.' : 'No vehicle types found.'}
              </div>
            ) : (
              filteredTypes.map((type) => (
                <div
                  key={type}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === type && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(type)}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>{type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
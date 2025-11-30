"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DriverDropdown({ 
  value, 
  onChange, 
  drivers = [], 
  placeholder = "Select driver",
  showDistance = false
}) {
  // Sort drivers by distance when showDistance is true
  const sortedDrivers = showDistance 
    ? [...drivers].sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    : drivers
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const filteredDrivers = sortedDrivers.filter(driver =>
    `${driver.first_name} ${driver.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.surname?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelect = (driver) => {
    onChange(driver.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  const selectedDriver = sortedDrivers.find(d => d.id === value)
  const displayValue = selectedDriver ? `${selectedDriver.first_name} ${selectedDriver.surname}` : ''

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
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{displayValue || placeholder}</span>
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
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredDrivers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchTerm ? 'No drivers match your search.' : 'No drivers found.'}
              </div>
            ) : (
              filteredDrivers.map((driver, index) => {
                const isClosest = showDistance && index === 0 && driver.distance !== null
                return (
                  <div
                    key={driver.id}
                    className={cn(
                      "relative flex cursor-default select-none items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value === driver.id && "bg-accent text-accent-foreground",
                      isClosest && "bg-blue-50 border border-blue-200"
                    )}
                    onClick={() => handleSelect(driver)}
                  >
                    <div className="flex items-center gap-2">
                      <User className={cn("h-4 w-4", isClosest && "text-blue-600")} />
                      <span className={cn(isClosest && "font-medium text-blue-900")}>
                        {driver.first_name} {driver.surname}
                        {isClosest && <span className="ml-1 text-xs text-blue-600">(Closest)</span>}
                      </span>
                    </div>
                    {showDistance && driver.distance !== null && (
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          isClosest 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {driver.distance}km
                        </span>
                        {driver.driverToLoading && driver.loadingToDropoff && (
                          <span className="text-xs text-muted-foreground" title={`Driver to Loading: ${driver.driverToLoading}km, Loading to Drop-off: ${driver.loadingToDropoff}km`}>
                            ({driver.driverToLoading}+{driver.loadingToDropoff})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
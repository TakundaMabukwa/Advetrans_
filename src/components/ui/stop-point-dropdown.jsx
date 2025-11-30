'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { MapPin, Search } from 'lucide-react'

export function StopPointDropdown({ 
  value, 
  onChange, 
  stopPoints = [],
  placeholder = "Search stop points...",
  isLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Filter stop points based on search term
  const filteredStopPoints = useMemo(() => {
    if (!searchTerm) return stopPoints.slice(0, 50) // Limit initial results
    
    return stopPoints.filter(point => 
      point.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.name2?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20) // Limit search results
  }, [stopPoints, searchTerm])

  // Get selected stop point display name
  const selectedStopPoint = stopPoints.find(p => p.id.toString() === value)
  const displayValue = selectedStopPoint 
    ? `${selectedStopPoint.name}${selectedStopPoint.name2 ? ` - ${selectedStopPoint.name2}` : ''}`
    : ''

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setShowDropdown(true)
  }

  const handleStopPointSelect = (stopPoint) => {
    console.log('Stop point selected:', stopPoint)
    console.log('Calling onChange with ID:', stopPoint.id.toString())
    setSearchTerm('')
    setShowDropdown(false)
    // Call onChange after state updates to ensure proper re-rendering
    setTimeout(() => onChange(stopPoint.id.toString()), 0)
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 150)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setShowDropdown(false)
  }

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value ? displayValue : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          placeholder={placeholder}
          className="pr-8"
          autoComplete="off"
        />
        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Loading stop points...</div>
          ) : filteredStopPoints.length > 0 ? (
            <>
              {value && (
                <div
                  className="p-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 text-red-600 font-medium"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleClear()
                  }}
                >
                  Clear selection
                </div>
              )}
              {filteredStopPoints.map((stopPoint) => (
                <div
                  key={stopPoint.id}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleStopPointSelect(stopPoint)
                  }}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {stopPoint.name}
                      </div>
                      {stopPoint.name2 && (
                        <div className="text-xs text-gray-500 truncate">
                          {stopPoint.name2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {searchTerm && filteredStopPoints.length === 0 && (
                <div className="p-3 text-sm text-gray-500">No stop points found</div>
              )}
            </>
          ) : (
            <div className="p-3 text-sm text-gray-500">
              {searchTerm ? 'No stop points found' : 'Start typing to search...'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
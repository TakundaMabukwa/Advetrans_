'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin } from 'lucide-react'

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter location", 
  label,
  clientLocations = []
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      
      // Filter client locations first
      const clientMatches = clientLocations
        .filter(loc => 
          loc.name?.toLowerCase().includes(value.toLowerCase()) ||
          loc.address?.toLowerCase().includes(value.toLowerCase())
        )
        .map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          type: 'client'
        }))

      // Mapbox Geocoding API
      let mapboxPlaces = []
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (mapboxToken) {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${mapboxToken}&country=za&limit=5`
          )
          const data = await response.json()
          mapboxPlaces = data.features?.map((feature, index) => ({
            id: `mapbox_${index}`,
            name: feature.text,
            address: feature.place_name,
            type: 'mapbox'
          })) || []
        }
      } catch (error) {
        console.error('Mapbox geocoding error:', error)
      }

      setSuggestions([...clientMatches, ...mapboxPlaces])
      setShowSuggestions(true)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.address || suggestion.name)
    setShowSuggestions(false)
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    if (newValue.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const handleInputFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pr-8"
          autoComplete="off"
        />
        <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-3 text-sm text-gray-500">Searching...</div>
          )}
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {suggestion.name}
                  </div>
                  {suggestion.address && suggestion.address !== suggestion.name && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.address}
                    </div>
                  )}
                  {suggestion.type === 'client' && (
                    <div className="text-xs text-blue-600 mt-1">Client Location</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MapPin, X } from 'lucide-react'
import { searchPlaces } from '@/lib/mapbox-geocoding'

export default function AddressAutocomplete({
    label,
    value,
    onChange,
    onCoordinatesChange,
    onAddressSelect,
    placeholder = 'Start typing an address...',
    required = false,
}) {
    const [suggestions, setSuggestions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef(null)
    const suggestionsRef = useRef(null)

    useEffect(() => {
        const searchAddresses = async () => {
            if (value?.length < 3) {
                setSuggestions([])
                setShowSuggestions(false)
                return
            }

            setIsLoading(true)
            try {
                const results = await searchPlaces(value, 5)
                setSuggestions(results)
                setShowSuggestions(results.length > 0)
            } catch (error) {
                console.error('Address search error:', error)
                setSuggestions([])
                setShowSuggestions(false)
            } finally {
                setIsLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchAddresses, 300)
        return () => clearTimeout(debounceTimer)
    }, [value])

    const handleSuggestionClick = async (suggestion) => {
        const [lng, lat] = suggestion.center
        onChange(suggestion.place_name)
        setShowSuggestions(false)
        setSuggestions([])

        const context = suggestion.context || []
        const street = suggestion.text || ''
        let city = ''
        let state = ''
        let country = ''

        context.forEach((item) => {
            if (item.id.startsWith('place')) {
                city = item.text
            } else if (item.id.startsWith('region')) {
                state = item.text
            } else if (item.id.startsWith('country')) {
                country = item.text
            }
        })

        if (onCoordinatesChange) {
            onCoordinatesChange({ lat, lng })
        }

        if (onAddressSelect) {
            onAddressSelect({
                street,
                city,
                state,
                country,
                formatted_address: suggestion.place_name,
            })
        }
    }

    const handleKeyDown = (e) => {
        if (!showSuggestions) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionClick(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                setSelectedIndex(-1)
                break
            default:
                break
        }
    }

    const clearInput = () => {
        onChange('')
        setSuggestions([])
        setShowSuggestions(false)
        if (inputRef.current) inputRef.current.focus()
    }

    return (
        <div className="relative space-y-2">
            <Label htmlFor="address-input">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        ref={inputRef}
                        id="address-input"
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() =>
                            value?.length >= 3 && setShowSuggestions(suggestions.length > 0)
                        }
                        placeholder={placeholder}
                        className="pl-10 pr-10"
                        required={required}
                    />
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearInput}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((suggestion, index) => (
                            <div
                                // key={suggestion.id}
                                key={index}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-blue-50' : ''
                                    }`}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {suggestion.text}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {suggestion.place_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
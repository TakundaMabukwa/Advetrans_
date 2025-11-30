import { useState, useEffect } from 'react'

export const useTripRoute = (tripId) => {
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [highRiskViolations, setHighRiskViolations] = useState([])

  const fetchRoute = async (id = tripId) => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/trip-route?tripId=${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch route')
      }

      const data = await response.json()
      
      setRoute(data)
      setHighRiskViolations(data.highRiskViolations || [])
      
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching trip route:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tripId) {
      fetchRoute(tripId)
    }
  }, [tripId])

  return {
    route,
    loading,
    error,
    highRiskViolations,
    hasHighRiskViolations: highRiskViolations.length > 0,
    refetch: fetchRoute
  }
}
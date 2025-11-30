'use client'

import { useEffect, useState } from 'react'

export default function Blocker() {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    // Add any blocking logic here if needed
    // For now, this is just a placeholder component
  }, [])

  if (!isBlocked) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p>Loading...</p>
      </div>
    </div>
  )
} 
'use client'

import { useEffect, useState } from 'react'

const CountUp = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const numericValue = Number(value)
    if (isNaN(numericValue)) return

    const frameRate = 1000 / 60 // 60fps
    const totalFrames = Math.round(duration / frameRate)
    let frame = 0

    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const currentCount = Math.floor(numericValue * progress)
      setCount(currentCount)

      if (progress >= 1) {
        clearInterval(counter)
        setCount(Math.floor(numericValue)) // Final number
      }
    }, frameRate)

    return () => clearInterval(counter)
  }, [value, duration])

  return <span>{count}</span>
}

export default CountUp
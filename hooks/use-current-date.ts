'use client'

import { useState, useEffect } from 'react'
import { getTodayString } from '@/lib/utils/date'

/**
 * Returns today's date string ('yyyy-MM-dd') as reactive state.
 * Re-checks on tab focus (visibilitychange) and every 60 seconds so
 * components automatically re-render when the calendar date rolls over,
 * even when the app has been open across midnight without a navigation.
 */
export function useCurrentDate(): string {
  const [today, setToday] = useState<string>(getTodayString)

  useEffect(() => {
    const checkDate = () => {
      const current = getTodayString()
      setToday((prev) => (prev !== current ? current : prev))
    }

    document.addEventListener('visibilitychange', checkDate)
    const id = setInterval(checkDate, 60_000)

    return () => {
      document.removeEventListener('visibilitychange', checkDate)
      clearInterval(id)
    }
  }, [])

  return today
}

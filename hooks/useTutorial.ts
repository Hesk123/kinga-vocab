'use client'

import { useState, useEffect, useCallback } from 'react'
import { isTutorialSeen, markTutorialSeen } from '@/lib/storage'

interface UseTutorialReturn {
  shouldShow: boolean
  dismiss: () => void
}

export function useTutorial(): UseTutorialReturn {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Only check on client after mount
    if (!isTutorialSeen()) {
      setShouldShow(true)
    }
  }, [])

  const dismiss = useCallback(() => {
    markTutorialSeen()
    setShouldShow(false)
  }, [])

  return { shouldShow, dismiss }
}

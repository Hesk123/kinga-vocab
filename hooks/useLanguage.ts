'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Language } from '@/lib/types'
import { getActiveLang, setActiveLang } from '@/lib/storage'
import { isValidLanguage } from '@/lib/constants'

export function useLanguage() {
  const router = useRouter()

  const switchLanguage = useCallback(
    (lang: Language) => {
      setActiveLang(lang)
      router.push(`/${lang}`)
    },
    [router]
  )

  return {
    getStoredLang: getActiveLang,
    switchLanguage,
    isValidLanguage,
  }
}

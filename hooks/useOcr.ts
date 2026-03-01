'use client'

import { useState, useCallback } from 'react'
import type { Language } from '@/lib/types'
import { extractVocab } from '@/lib/ocr'

interface ExtractedPair {
  polish: string
  translation: string
  example?: string
}

type OcrState = 'idle' | 'loading' | 'review' | 'error'

interface UseOcrReturn {
  state: OcrState
  pairs: ExtractedPair[]
  error: string | null
  imagePreview: string | null
  uploadImage: (file: File) => Promise<void>
  reset: () => void
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Nie udalo sie odczytac pliku'))
      }
    }
    reader.onerror = () => reject(new Error('Blad odczytu pliku'))
    reader.readAsDataURL(file)
  })
}

export function useOcr(lang: Language): UseOcrReturn {
  const [state, setState] = useState<OcrState>('idle')
  const [pairs, setPairs] = useState<ExtractedPair[]>([])
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const uploadImage = useCallback(
    async (file: File) => {
      setState('loading')
      setError(null)
      setPairs([])

      try {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Wybrany plik nie jest zdjeciem')
        }

        // 20MB limit
        if (file.size > 20 * 1024 * 1024) {
          throw new Error('Plik jest za duzy. Maksymalnie 20MB.')
        }

        const base64 = await fileToBase64(file)
        setImagePreview(base64)

        const extractedPairs = await extractVocab(base64, lang)

        if (extractedPairs.length === 0) {
          throw new Error('Nie znaleziono slowek na zdjeciu. Sprobuj lepsze zdjecie.')
        }

        setPairs(extractedPairs)
        setState('review')
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Nie udalo sie odczytac zdjecia. Sprobuj ponownie.'
        setError(message)
        setState('error')
      }
    },
    [lang]
  )

  const reset = useCallback(() => {
    setState('idle')
    setPairs([])
    setError(null)
    setImagePreview(null)
  }, [])

  return {
    state,
    pairs,
    error,
    imagePreview,
    uploadImage,
    reset,
  }
}

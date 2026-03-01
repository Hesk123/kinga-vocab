'use client'

import { useState, useCallback } from 'react'
import type { Language } from '@/lib/types'
import { extractVocabFromText, extractVocab } from '@/lib/ocr'
import { extractTextFromPdf, extractTextFromDocx } from '@/lib/file-parser'

interface ExtractedPair {
  polish: string
  translation: string
  example?: string
}

type FileImportState = 'idle' | 'loading' | 'review' | 'error'

interface UseFileImportReturn {
  state: FileImportState
  pairs: ExtractedPair[]
  error: string | null
  fileName: string | null
  processFile: (file: File) => Promise<void>
  reset: () => void
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Nie udalo sie odczytac pliku'))
      }
    }
    reader.onerror = () => reject(new Error('Blad odczytu pliku'))
    reader.readAsText(file)
  })
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Nie udalo sie odczytac pliku'))
      }
    }
    reader.onerror = () => reject(new Error('Blad odczytu pliku'))
    reader.readAsDataURL(file)
  })
}

const TEXT_TYPES = [
  'text/plain',
  'text/csv',
  'text/tab-separated-values',
  'application/json',
]

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

function isTextFile(file: File): boolean {
  if (TEXT_TYPES.includes(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ['txt', 'csv', 'tsv', 'md', 'rtf'].includes(ext || '')
}

function isImageFile(file: File): boolean {
  return IMAGE_TYPES.some(t => file.type.startsWith(t.split('/')[0])) || file.type.startsWith('image/')
}

function isPdfFile(file: File): boolean {
  if (file.type === 'application/pdf') return true
  return file.name.toLowerCase().endsWith('.pdf')
}

function isDocxFile(file: File): boolean {
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true
  return file.name.toLowerCase().endsWith('.docx')
}

export function useFileImport(lang: Language): UseFileImportReturn {
  const [state, setState] = useState<FileImportState>('idle')
  const [pairs, setPairs] = useState<ExtractedPair[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const processFile = useCallback(
    async (file: File) => {
      setState('loading')
      setError(null)
      setPairs([])
      setFileName(file.name)

      try {
        // 20MB limit
        if (file.size > 20 * 1024 * 1024) {
          throw new Error('Plik jest za duzy. Maksymalnie 20MB.')
        }

        let extractedPairs: ExtractedPair[]

        if (isImageFile(file)) {
          // Use vision API for images
          const base64 = await readFileAsBase64(file)
          extractedPairs = await extractVocab(base64, lang)
        } else if (isPdfFile(file)) {
          // Extract text from PDF, then send to AI
          const text = await extractTextFromPdf(file)
          if (text.trim().length < 5) {
            throw new Error('Plik PDF jest pusty lub nie zawiera tekstu.')
          }
          extractedPairs = await extractVocabFromText(text, lang)
        } else if (isDocxFile(file)) {
          // Extract text from DOCX, then send to AI
          const text = await extractTextFromDocx(file)
          if (text.trim().length < 5) {
            throw new Error('Plik Word jest pusty lub nie zawiera tekstu.')
          }
          extractedPairs = await extractVocabFromText(text, lang)
        } else if (isTextFile(file)) {
          // Read as text and send to AI
          const text = await readFileAsText(file)
          if (text.trim().length < 5) {
            throw new Error('Plik jest pusty lub za krotki.')
          }
          extractedPairs = await extractVocabFromText(text, lang)
        } else {
          // Try reading as text for unknown types (.txt with wrong mime, etc.)
          try {
            const text = await readFileAsText(file)
            if (text.trim().length < 5) {
              throw new Error('short')
            }
            extractedPairs = await extractVocabFromText(text, lang)
          } catch {
            throw new Error('Nieobslugiwany format pliku. Uzyj: PDF, Word, zdjecia, .txt lub .csv')
          }
        }

        if (extractedPairs.length === 0) {
          throw new Error('Nie znaleziono slowek w pliku. Sprobuj inny plik.')
        }

        setPairs(extractedPairs)
        setState('review')
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Nie udalo sie odczytac pliku. Sprobuj ponownie.'
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
    setFileName(null)
  }, [])

  return {
    state,
    pairs,
    error,
    fileName,
    processFile,
    reset,
  }
}

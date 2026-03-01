'use client'

import { useState, useDeferredValue, useMemo } from 'react'
import type { VocabEntry } from '@/lib/types'

interface UseSearchReturn {
  query: string
  setQuery: (query: string) => void
  filteredEntries: VocabEntry[]
  isSearching: boolean
  resultCount: number
}

export function useSearch(entries: VocabEntry[]): UseSearchReturn {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filteredEntries = useMemo(() => {
    const trimmed = deferredQuery.trim().toLowerCase()
    if (!trimmed) return entries

    return entries.filter(
      (entry) =>
        entry.polish.toLowerCase().includes(trimmed) ||
        entry.translation.toLowerCase().includes(trimmed)
    )
  }, [entries, deferredQuery])

  const isSearching = query.trim().length > 0

  return {
    query,
    setQuery,
    filteredEntries,
    isSearching,
    resultCount: filteredEntries.length,
  }
}

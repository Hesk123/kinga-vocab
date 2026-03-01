'use client'

import { useReducer, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { Language, VocabEntry, VocabAction, NewVocabEntry } from '@/lib/types'
import { getVocab, setVocab } from '@/lib/storage'

function vocabReducer(state: VocabEntry[], action: VocabAction): VocabEntry[] {
  switch (action.type) {
    case 'SET_ENTRIES':
      return action.entries

    case 'ADD_ENTRIES': {
      const existingKeys = new Set(
        state.map((e) => `${e.polish.toLowerCase().trim()}::${e.translation.toLowerCase().trim()}`)
      )
      const newEntries: VocabEntry[] = action.entries
        .filter((entry) => {
          const key = `${entry.polish.toLowerCase().trim()}::${entry.translation.toLowerCase().trim()}`
          return !existingKeys.has(key)
        })
        .map((entry) => ({
          ...entry,
          id: nanoid(),
          addedAt: new Date().toISOString(),
        }))
      return [...state, ...newEntries]
    }

    case 'REMOVE_ENTRY':
      return state.filter((e) => e.id !== action.id)

    case 'CLEAR_ALL':
      return []

    default:
      return state
  }
}

function sortAlphabetically(entries: VocabEntry[]): VocabEntry[] {
  return [...entries].sort((a, b) =>
    a.polish.localeCompare(b.polish, 'pl', { sensitivity: 'base' })
  )
}

export function useVocab(lang: Language) {
  const [entries, dispatch] = useReducer(vocabReducer, [])

  // Load entries from localStorage on mount / language change
  useEffect(() => {
    const stored = getVocab(lang)
    dispatch({ type: 'SET_ENTRIES', entries: stored })
  }, [lang])

  // Persist entries whenever they change (skip initial empty state)
  useEffect(() => {
    // Only persist if we have loaded at least once
    setVocab(lang, entries)
  }, [entries, lang])

  const addEntries = useCallback((newEntries: NewVocabEntry[]) => {
    dispatch({ type: 'ADD_ENTRIES', entries: newEntries })
  }, [])

  const removeEntry = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ENTRY', id })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  const sortedEntries = sortAlphabetically(entries)

  return {
    entries: sortedEntries,
    count: entries.length,
    addEntries,
    removeEntry,
    clearAll,
  }
}

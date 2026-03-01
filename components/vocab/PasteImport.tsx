'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { parseWordList, findDuplicates } from '@/lib/vocab-parser'
import { ImportReview } from './ImportReview'
import type { VocabEntry } from '@/lib/types'

interface PasteImportProps {
  existingEntries: VocabEntry[]
  onAdd: (pairs: Array<{ polish: string; translation: string }>) => void
}

type PasteState = 'input' | 'review'

export function PasteImport({ existingEntries, onAdd }: PasteImportProps) {
  const [state, setState] = useState<PasteState>('input')
  const [text, setText] = useState('')
  const [parsedPairs, setParsedPairs] = useState<
    Array<{ polish: string; translation: string }>
  >([])
  const [duplicateIndices, setDuplicateIndices] = useState<Set<number>>(
    new Set()
  )

  const handleAnalyze = useCallback(() => {
    const pairs = parseWordList(text)
    if (pairs.length === 0) return

    const dups = findDuplicates(pairs, existingEntries)
    setParsedPairs(pairs)
    setDuplicateIndices(dups)
    setState('review')
  }, [text, existingEntries])

  const handleAdd = useCallback(
    (selected: Array<{ polish: string; translation: string }>) => {
      onAdd(selected)
      // Reset to input after adding
      setText('')
      setParsedPairs([])
      setDuplicateIndices(new Set())
      setState('input')
    },
    [onAdd]
  )

  const handleBack = useCallback(() => {
    setState('input')
  }, [])

  const pairsCount = parseWordList(text).length

  if (state === 'review' && parsedPairs.length > 0) {
    const newCount = parsedPairs.filter(
      (_, i) => !duplicateIndices.has(i)
    ).length

    return (
      <ImportReview
        pairs={parsedPairs}
        duplicateIndices={duplicateIndices}
        onAdd={handleAdd}
        onBack={handleBack}
        addButtonLabel={`Dodaj nowe (${newCount})`}
        showExamples={false}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full resize-none rounded-2xl border-2 px-4 py-3 text-sm outline-none transition-colors"
          style={{
            background: 'var(--surface)',
            borderColor: text ? 'var(--primary)' : 'var(--border)',
            color: 'var(--text)',
          }}
          placeholder={`Wklej liste slowek tutaj...\n\nObslugiwane formaty:\nkot - cat\nkot: cat\nkot | cat\nkot\tcat`}
          aria-label="Pole do wklejania listy slowek"
        />
        {text && pairsCount > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            {pairsCount} {pairsCount === 1 ? 'para' : 'par'}
          </motion.span>
        )}
      </div>

      {/* Format info */}
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: 'var(--surface)' }}
      >
        <p
          className="mb-2 text-xs font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          Wskazowka
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Kazda para w osobnej linii. Rozdziel slowa jednym z separatorow:{' '}
          <span className="font-mono"> - </span>
          <span className="font-mono"> : </span>
          <span className="font-mono"> | </span> lub tabulatorem.
        </p>
      </div>

      {/* Analyze button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAnalyze}
        disabled={!text.trim() || pairsCount === 0}
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background:
            text.trim() && pairsCount > 0
              ? 'var(--primary)'
              : 'var(--border)',
        }}
      >
        {pairsCount > 0 ? `Analizuj (${pairsCount})` : 'Analizuj'}
      </motion.button>
    </motion.div>
  )
}

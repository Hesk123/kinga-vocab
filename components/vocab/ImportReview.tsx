'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

interface ReviewPair {
  polish: string
  translation: string
  example?: string
}

interface ImportReviewProps {
  pairs: ReviewPair[]
  duplicateIndices?: Set<number>
  onAdd: (selected: ReviewPair[]) => void
  onBack: () => void
  addButtonLabel?: string
  showExamples?: boolean
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.25,
      ease: 'easeOut',
    },
  }),
}

export function ImportReview({
  pairs,
  duplicateIndices = new Set(),
  onAdd,
  onBack,
  addButtonLabel,
  showExamples = true,
}: ImportReviewProps) {
  // Initialize: check all non-duplicates, uncheck duplicates
  const [checked, setChecked] = useState<Set<number>>(() => {
    const initial = new Set<number>()
    pairs.forEach((_, i) => {
      if (!duplicateIndices.has(i)) {
        initial.add(i)
      }
    })
    return initial
  })

  const [editingPairs, setEditingPairs] = useState<ReviewPair[]>(() => [...pairs])

  const selectedCount = checked.size
  const newCount = pairs.filter((_, i) => !duplicateIndices.has(i)).length
  const dupCount = duplicateIndices.size

  const allNonDuplicatesChecked = useMemo(() => {
    for (let i = 0; i < pairs.length; i++) {
      if (!duplicateIndices.has(i) && !checked.has(i)) return false
    }
    return true
  }, [checked, pairs.length, duplicateIndices])

  const toggleAll = useCallback(() => {
    if (allNonDuplicatesChecked) {
      setChecked(new Set())
    } else {
      const all = new Set<number>()
      pairs.forEach((_, i) => {
        if (!duplicateIndices.has(i)) {
          all.add(i)
        }
      })
      setChecked(all)
    }
  }, [allNonDuplicatesChecked, pairs, duplicateIndices])

  const toggleOne = useCallback((index: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const updatePair = useCallback(
    (index: number, field: keyof ReviewPair, value: string) => {
      setEditingPairs((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
    },
    []
  )

  const handleAdd = useCallback(() => {
    const selected = editingPairs.filter((_, i) => checked.has(i))
    onAdd(selected)
  }, [editingPairs, checked, onAdd])

  const label = addButtonLabel || `Dodaj zaznaczone (${selectedCount})`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Stats bar */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-2.5"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--success)' }}
            >
              {newCount} nowych
            </span>
          )}
          {dupCount > 0 && (
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {dupCount} {dupCount === 1 ? 'duplikat' : 'duplikatow'}
            </span>
          )}
        </div>
        <button
          onClick={toggleAll}
          className="text-xs font-medium cursor-pointer"
          style={{ color: 'var(--primary)' }}
        >
          {allNonDuplicatesChecked ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
        </button>
      </div>

      {/* Review table */}
      <div className="flex flex-col gap-1.5">
        <AnimatePresence>
          {editingPairs.map((pair, index) => {
            const isDuplicate = duplicateIndices.has(index)
            const isChecked = checked.has(index)

            return (
              <motion.div
                key={index}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                style={{
                  background: isDuplicate
                    ? 'var(--surface)'
                    : 'var(--surface-elevated)',
                  opacity: isDuplicate ? 0.55 : 1,
                  border: `1px solid ${isDuplicate ? 'var(--border-light)' : 'var(--border)'}`,
                }}
              >
                {/* Checkbox */}
                <label className="flex items-center pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(index)}
                    disabled={isDuplicate}
                    className="sr-only"
                  />
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors"
                    style={{
                      borderColor: isChecked ? 'var(--primary)' : 'var(--border)',
                      background: isChecked ? 'var(--primary)' : 'transparent',
                    }}
                  >
                    {isChecked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="white"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </div>
                </label>

                {/* Editable fields */}
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pair.polish}
                      onChange={(e) => updatePair(index, 'polish', e.target.value)}
                      disabled={isDuplicate}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                      style={{ color: 'var(--text)' }}
                      aria-label={`Polskie slowo, wiersz ${index + 1}`}
                    />
                    <span
                      className="shrink-0 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      &rarr;
                    </span>
                    <input
                      type="text"
                      value={pair.translation}
                      onChange={(e) =>
                        updatePair(index, 'translation', e.target.value)
                      }
                      disabled={isDuplicate}
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--text-secondary)' }}
                      aria-label={`Tlumaczenie, wiersz ${index + 1}`}
                    />
                  </div>
                  {showExamples && pair.example && (
                    <input
                      type="text"
                      value={pair.example}
                      onChange={(e) =>
                        updatePair(index, 'example', e.target.value)
                      }
                      disabled={isDuplicate}
                      className="bg-transparent text-xs italic outline-none"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label={`Przyklad, wiersz ${index + 1}`}
                    />
                  )}
                  {isDuplicate && (
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: 'var(--warning)' }}
                    >
                      juz istnieje
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="flex-1 rounded-xl py-3 text-sm font-medium cursor-pointer"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          Wstecz
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          disabled={selectedCount === 0}
          className="flex-[2] rounded-xl py-3 text-sm font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selectedCount > 0 ? 'var(--primary)' : 'var(--border)',
          }}
        >
          {label}
        </motion.button>
      </div>
    </motion.div>
  )
}

'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import type { VocabEntry } from '@/lib/types'
import { WordCard } from './WordCard'

interface WordListProps {
  entries: VocabEntry[]
  onDelete: (id: string) => void
}

interface LetterGroup {
  letter: string
  entries: VocabEntry[]
}

function groupByLetter(entries: VocabEntry[]): LetterGroup[] {
  const groups = new Map<string, VocabEntry[]>()

  for (const entry of entries) {
    const firstChar = entry.polish.charAt(0).toUpperCase()
    // Normalize Polish characters to their base letter for grouping
    const letter = firstChar || '#'
    if (!groups.has(letter)) {
      groups.set(letter, [])
    }
    groups.get(letter)!.push(entry)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'pl'))
    .map(([letter, entries]) => ({ letter, entries }))
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
}

export function WordList({ entries, onDelete }: WordListProps) {
  const groups = useMemo(() => groupByLetter(entries), [entries])

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1 px-4"
    >
      {groups.map((group) => (
        <div key={group.letter} id={`letter-${group.letter}`}>
          <div
            className="sticky top-12 z-10 -mx-4 px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{
              color: 'var(--primary)',
              background: 'var(--bg)',
            }}
          >
            {group.letter}
          </div>

          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-1.5">
              {group.entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                >
                  <WordCard entry={entry} onDelete={onDelete} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  )
}

export { groupByLetter }
export type { LetterGroup }

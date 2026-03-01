'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { VocabEntry } from '@/lib/types'

interface AlphaNavProps {
  entries: VocabEntry[]
  visible: boolean
}

// Polish alphabet letters that commonly appear
const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUWYZ'.split('')

export function AlphaNav({ entries, visible }: AlphaNavProps) {
  const activeLetters = useMemo(() => {
    const letters = new Set<string>()
    for (const entry of entries) {
      const first = entry.polish.charAt(0).toUpperCase()
      if (first) letters.add(first)
    }
    return letters
  }, [entries])

  function handleLetterClick(letter: string) {
    const target = document.getElementById(`letter-${letter}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (entries.length === 0) return null

  return (
    <motion.nav
      initial={{ opacity: 0, x: 8 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : 8,
        pointerEvents: visible ? 'auto' as const : 'none' as const,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed right-1 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center"
      aria-label="Nawigacja alfabetyczna"
    >
      <div
        className="flex flex-col items-center rounded-full px-1 py-1"
        style={{
          background: 'var(--surface-elevated)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-light)',
        }}
      >
        {ALPHABET.map((letter) => {
          const isActive = activeLetters.has(letter)
          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={!isActive}
              className="flex h-[18px] w-[22px] items-center justify-center text-[10px] font-semibold leading-none transition-colors"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--border)',
                cursor: isActive ? 'pointer' : 'default',
              }}
              aria-label={isActive ? `Przejdz do litery ${letter}` : undefined}
              tabIndex={isActive ? 0 : -1}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}

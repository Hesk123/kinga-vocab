'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import type { VocabEntry } from '@/lib/types'

interface WordCardProps {
  entry: VocabEntry
  onDelete: (id: string) => void
}

const SOURCE_LABELS: Record<VocabEntry['source'], string> = {
  manual: 'recznie',
  ocr: 'OCR',
  paste: 'wklejone',
}

export function WordCard({ entry, onDelete }: WordCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-120, -60, 0], [1, 0.6, 0])
  const deleteScale = useTransform(x, [-120, -60, 0], [1, 0.8, 0.5])

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    setIsDragging(false)
    if (info.offset.x < -100) {
      onDelete(entry.id)
    }
  }

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Delete reveal behind card */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-5"
        style={{
          background: 'var(--danger)',
          opacity: deleteOpacity,
          borderRadius: 'var(--radius-md)',
        }}
      >
        <motion.div style={{ scale: deleteScale }} className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span className="text-sm font-medium text-white">Usun</span>
        </motion.div>
      </motion.div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{
          x,
          background: 'var(--surface-elevated)',
          borderRadius: 'var(--radius-md)',
          touchAction: 'pan-y',
        }}
        className="relative flex items-start justify-between gap-3 px-4 py-3"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className="text-base font-semibold"
              style={{ color: 'var(--text)' }}
            >
              {entry.polish}
            </span>
            <span
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {entry.translation}
            </span>
          </div>

          {entry.example && (
            <p
              className="mt-1 text-xs italic leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {entry.example}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: 'var(--primary-lightest)',
              color: 'var(--primary)',
            }}
          >
            {SOURCE_LABELS[entry.source]}
          </span>

          {/* Delete fallback for desktop */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!isDragging) onDelete(entry.id)
            }}
            className="touch-target flex items-center justify-center rounded-lg p-1.5 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 sm:opacity-40"
            style={{ color: 'var(--danger)' }}
            aria-label={`Usun slowo ${entry.polish}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

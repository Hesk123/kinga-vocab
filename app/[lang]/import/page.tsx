'use client'

import { use, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Language, NewVocabEntry } from '@/lib/types'
import { isValidLanguage } from '@/lib/constants'
import { useVocab } from '@/hooks/useVocab'
import { useOcr } from '@/hooks/useOcr'
import { OcrUpload } from '@/components/vocab/OcrUpload'
import { OcrReview } from '@/components/vocab/OcrReview'
import { PasteImport } from '@/components/vocab/PasteImport'

type ImportTab = 'photo' | 'paste'

interface ImportPageProps {
  params: Promise<{ lang: string }>
}

function SuccessBanner({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="mb-4 flex items-center justify-between rounded-xl px-4 py-3"
      style={{ background: 'var(--success-light)' }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--success)' }}
      >
        Dodano {count} {count === 1 ? 'slowko' : 'slowek'}!
      </span>
      <button
        onClick={onDismiss}
        className="text-sm font-medium cursor-pointer"
        style={{ color: 'var(--success)' }}
        aria-label="Zamknij"
      >
        &#x2715;
      </button>
    </motion.div>
  )
}

export default function ImportPage({ params }: ImportPageProps) {
  const { lang: langParam } = use(params)
  const lang: Language = isValidLanguage(langParam) ? langParam : 'en'

  const [activeTab, setActiveTab] = useState<ImportTab>('photo')
  const [successCount, setSuccessCount] = useState<number | null>(null)

  const { entries, addEntries } = useVocab(lang)
  const {
    state: ocrState,
    pairs: ocrPairs,
    error: ocrError,
    imagePreview,
    uploadImage,
    reset: resetOcr,
  } = useOcr(lang)

  const handleOcrFileSelected = useCallback(
    (file: File) => {
      setSuccessCount(null)
      uploadImage(file)
    },
    [uploadImage]
  )

  const handleOcrAdd = useCallback(
    (
      selected: Array<{
        polish: string
        translation: string
        example?: string
      }>
    ) => {
      const newEntries: NewVocabEntry[] = selected.map((pair) => ({
        polish: pair.polish,
        translation: pair.translation,
        example: pair.example,
        source: 'ocr' as const,
      }))
      addEntries(newEntries)
      setSuccessCount(selected.length)
      resetOcr()
    },
    [addEntries, resetOcr]
  )

  const handlePasteAdd = useCallback(
    (selected: Array<{ polish: string; translation: string }>) => {
      const newEntries: NewVocabEntry[] = selected.map((pair) => ({
        polish: pair.polish,
        translation: pair.translation,
        source: 'paste' as const,
      }))
      addEntries(newEntries)
      setSuccessCount(selected.length)
    },
    [addEntries]
  )

  const showTabs = ocrState === 'idle' || ocrState === 'error'

  return (
    <div className="px-4 py-5">
      {/* Page title */}
      <h2
        className="mb-5 text-lg font-bold"
        style={{ color: 'var(--text)' }}
      >
        Importuj slowka
      </h2>

      {/* Success banner */}
      {successCount !== null && (
        <SuccessBanner
          count={successCount}
          onDismiss={() => setSuccessCount(null)}
        />
      )}

      {/* Tab switcher — hidden when OCR is loading or in review */}
      {showTabs && (
        <div
          className="mb-5 flex rounded-xl p-1"
          style={{ background: 'var(--surface)' }}
          role="tablist"
          aria-label="Metoda importu"
        >
          <TabButton
            label="Zdjecie"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            }
            isActive={activeTab === 'photo'}
            onClick={() => setActiveTab('photo')}
          />
          <TabButton
            label="Wklej"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            }
            isActive={activeTab === 'paste'}
            onClick={() => setActiveTab('paste')}
          />
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'photo' && (
        <div>
          {ocrState === 'review' && ocrPairs.length > 0 ? (
            <OcrReview
              pairs={ocrPairs}
              onAdd={handleOcrAdd}
              onBack={resetOcr}
            />
          ) : (
            <OcrUpload
              onFileSelected={handleOcrFileSelected}
              isLoading={ocrState === 'loading'}
              error={ocrError}
              imagePreview={imagePreview}
              onRetry={resetOcr}
            />
          )}
        </div>
      )}

      {activeTab === 'paste' && (
        <PasteImport
          existingEntries={entries}
          onAdd={handlePasteAdd}
        />
      )}
    </div>
  )
}

/* --- Tab Button Sub-component --- */

interface TabButtonProps {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className="relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors cursor-pointer"
      style={{
        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
        background: isActive ? 'var(--surface-elevated)' : 'transparent',
        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {isActive && (
        <motion.div
          layoutId="importTab"
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'var(--surface-elevated)',
            boxShadow: 'var(--shadow-sm)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  )
}

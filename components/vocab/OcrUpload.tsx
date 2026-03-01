'use client'

import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface OcrUploadProps {
  onFileSelected: (file: File) => void
  isLoading: boolean
  error: string | null
  imagePreview: string | null
  onRetry: () => void
}

function CameraIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--primary)' }}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="animate-spin"
      style={{ color: 'var(--primary)' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export function OcrUpload({
  onFileSelected,
  isLoading,
  error,
  imagePreview,
  onRetry,
}: OcrUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelected(file)
      }
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [onFileSelected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        onFileSelected(file)
      }
    },
    [onFileSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl p-8"
        style={{ background: 'var(--surface)' }}
      >
        {imagePreview && (
          <div className="overflow-hidden rounded-xl" style={{ maxWidth: 120 }}>
            <img
              src={imagePreview}
              alt="Przeslane zdjecie"
              className="h-auto w-full object-cover"
              style={{ maxHeight: 90 }}
            />
          </div>
        )}
        <SpinnerIcon />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Analizuje zdjecie...
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          To moze zajac kilka sekund
        </p>
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
        style={{ background: 'var(--danger-light)' }}
      >
        <div className="text-3xl">&#x26A0;&#xFE0F;</div>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--danger)' }}
        >
          {error}
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white cursor-pointer"
          style={{ background: 'var(--primary)' }}
        >
          Sprobuj ponownie
        </motion.button>
      </motion.div>
    )
  }

  // Idle state — upload area
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        aria-label="Wybierz zdjecie"
      />

      <motion.div
        whileHover={{ borderColor: 'var(--primary)' }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface)',
        }}
        role="button"
        tabIndex={0}
        aria-label="Zrob zdjecie lub wybierz plik ze zdjeciem slowek"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <CameraIcon />
        <div className="text-center">
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Zrob zdjecie lub wybierz plik
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Zdjecie podrecznika, cwiczen lub notatek
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

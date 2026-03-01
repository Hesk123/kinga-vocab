'use client'

import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface FileUploadProps {
  onFileSelected: (file: File) => void
  isLoading: boolean
  error: string | null
  fileName: string | null
  onRetry: () => void
}

function FileIcon() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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

export function FileUpload({
  onFileSelected,
  isLoading,
  error,
  fileName,
  onRetry,
}: FileUploadProps) {
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
      if (file) {
        onFileSelected(file)
      }
    },
    [onFileSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl p-8"
        style={{ background: 'var(--surface)' }}
      >
        <SpinnerIcon />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Analizuje plik...
        </p>
        {fileName && (
          <p
            className="text-xs truncate max-w-[200px]"
            style={{ color: 'var(--text-muted)' }}
          >
            {fileName}
          </p>
        )}
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          To moze zajac kilka sekund
        </p>
      </motion.div>
    )
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.csv,.tsv,.md,.pdf,.docx,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
        onChange={handleChange}
        className="hidden"
        aria-label="Wybierz plik"
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
        aria-label="Wybierz plik z slowkami"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <FileIcon />
        <div className="text-center">
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Wybierz plik ze slowkami
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            PDF, Word, pliki tekstowe lub zdjecia
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

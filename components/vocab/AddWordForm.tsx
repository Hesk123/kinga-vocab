'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { NewVocabEntry } from '@/lib/types'

interface AddWordFormProps {
  onSubmit: (entries: NewVocabEntry[]) => void
  onSuccess: () => void
}

interface FormErrors {
  polish?: string
  translation?: string
}

export function AddWordForm({ onSubmit, onSuccess }: AddWordFormProps) {
  const [polish, setPolish] = useState('')
  const [translation, setTranslation] = useState('')
  const [example, setExample] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const translationRef = useRef<HTMLInputElement>(null)
  const exampleRef = useRef<HTMLTextAreaElement>(null)

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    const trimmedPolish = polish.trim()
    const trimmedTranslation = translation.trim()

    if (!trimmedPolish) {
      newErrors.polish = 'Wpisz slowo po polsku'
    }
    if (!trimmedTranslation) {
      newErrors.translation = 'Wpisz tlumaczenie'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [polish, translation])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const entry: NewVocabEntry = {
      polish: polish.trim(),
      translation: translation.trim(),
      source: 'manual',
    }
    const trimmedExample = example.trim()
    if (trimmedExample) {
      entry.example = trimmedExample
    }

    onSubmit([entry])

    // Clear form
    setPolish('')
    setTranslation('')
    setExample('')
    setErrors({})

    onSuccess()
  }

  function handlePolishKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      translationRef.current?.focus()
    }
  }

  function handleTranslationKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      exampleRef.current?.focus()
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="flex flex-col gap-5 px-4 pt-4"
    >
      {/* Polish word */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="polish"
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Po polsku
        </label>
        <input
          id="polish"
          type="text"
          value={polish}
          onChange={(e) => {
            setPolish(e.target.value)
            if (errors.polish) setErrors((prev) => ({ ...prev, polish: undefined }))
          }}
          onKeyDown={handlePolishKeyDown}
          placeholder="np. kot"
          autoComplete="off"
          autoCapitalize="none"
          className="rounded-xl px-4 py-3 text-base outline-none transition-all"
          style={{
            background: 'var(--surface)',
            border: errors.polish
              ? '1.5px solid var(--danger)'
              : '1.5px solid var(--border-light)',
            color: 'var(--text)',
            borderRadius: 'var(--radius-md)',
          }}
        />
        {errors.polish && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            {errors.polish}
          </p>
        )}
      </div>

      {/* Translation */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="translation"
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Tlumaczenie
        </label>
        <input
          id="translation"
          ref={translationRef}
          type="text"
          value={translation}
          onChange={(e) => {
            setTranslation(e.target.value)
            if (errors.translation) setErrors((prev) => ({ ...prev, translation: undefined }))
          }}
          onKeyDown={handleTranslationKeyDown}
          placeholder="np. cat"
          autoComplete="off"
          autoCapitalize="none"
          className="rounded-xl px-4 py-3 text-base outline-none transition-all"
          style={{
            background: 'var(--surface)',
            border: errors.translation
              ? '1.5px solid var(--danger)'
              : '1.5px solid var(--border-light)',
            color: 'var(--text)',
            borderRadius: 'var(--radius-md)',
          }}
        />
        {errors.translation && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            {errors.translation}
          </p>
        )}
      </div>

      {/* Example sentence */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="example"
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Przykladowe zdanie
          <span
            className="ml-1 text-xs font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            (opcjonalnie)
          </span>
        </label>
        <textarea
          id="example"
          ref={exampleRef}
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="np. The cat is sleeping on the sofa."
          rows={3}
          autoComplete="off"
          className="resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border-light)',
            color: 'var(--text)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="mt-2 rounded-xl py-3.5 text-base font-semibold text-white transition-colors cursor-pointer touch-target"
        style={{
          background: 'var(--primary)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        Dodaj slowo
      </motion.button>
    </motion.form>
  )
}

'use client'

import { use } from 'react'
import type { Language } from '@/lib/types'
import { isValidLanguage, getLanguageConfig } from '@/lib/constants'
import { useVocab } from '@/hooks/useVocab'
import { useToast } from '@/context/ToastContext'
import { AddWordForm } from '@/components/vocab/AddWordForm'

interface DodajPageProps {
  params: Promise<{ lang: string }>
}

export default function DodajPage({ params }: DodajPageProps) {
  const { lang: langParam } = use(params)
  const lang = isValidLanguage(langParam) ? langParam : ('en' as Language)
  const config = getLanguageConfig(lang)
  const { addEntries } = useVocab(lang)
  const { showToast } = useToast()

  function handleSuccess() {
    showToast('Slowo dodane!')
  }

  return (
    <div className="pb-8">
      <div className="px-4 pt-4 pb-2">
        <h2
          className="text-lg font-bold"
          style={{ color: 'var(--text)' }}
        >
          Dodaj slowo
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Dodaj nowe slowo do slownika ({config.label.toLowerCase()})
        </p>
      </div>

      <AddWordForm onSubmit={addEntries} onSuccess={handleSuccess} />
    </div>
  )
}

'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import type { Language } from '@/lib/types'
import { isValidLanguage } from '@/lib/constants'
import { useVocab } from '@/hooks/useVocab'
import { useSearch } from '@/hooks/useSearch'
import { WordList } from '@/components/vocab/WordList'
import { AlphaNav } from '@/components/vocab/AlphaNav'
import { SearchBar } from '@/components/vocab/SearchBar'

interface LangPageProps {
  params: Promise<{ lang: string }>
}

export default function DictionaryPage({ params }: LangPageProps) {
  const { lang: langParam } = use(params)
  const lang = isValidLanguage(langParam) ? langParam : ('en' as Language)

  const { entries, removeEntry } = useVocab(lang)
  const { query, setQuery, filteredEntries, isSearching, resultCount } = useSearch(entries)

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
            style={{ background: 'var(--primary-light)' }}
          >
            {'\u{1F4D6}'}
          </div>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Brak slow
          </h2>
          <p
            className="max-w-xs text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Dodaj pierwsze slowo klikajac &quot;Dodaj&quot; lub &quot;Importuj&quot; ponizej.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative pb-4">
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        resultCount={resultCount}
        isSearching={isSearching}
      />

      {/* No search results */}
      {isSearching && filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ background: 'var(--surface)' }}
          >
            {'\u{1F50D}'}
          </div>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Nie znaleziono slow pasujacych do &quot;{query}&quot;
          </p>
        </div>
      ) : (
        <WordList entries={filteredEntries} onDelete={removeEntry} />
      )}

      <AlphaNav entries={filteredEntries} visible={!isSearching} />
    </div>
  )
}

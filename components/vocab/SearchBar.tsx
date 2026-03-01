'use client'

import { useRef } from 'react'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  resultCount: number
  isSearching: boolean
}

export function SearchBar({ query, onQueryChange, resultCount, isSearching }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClear() {
    onQueryChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="px-4 pb-2 pt-3">
      <div
        className="relative flex items-center overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Search icon */}
        <div
          className="pointer-events-none flex shrink-0 items-center pl-3"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Szukaj slowa..."
          className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
          style={{ color: 'var(--text)' }}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />

        {/* Clear button */}
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="flex shrink-0 items-center justify-center px-3 transition-opacity touch-target cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Wyczysc wyszukiwanie"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      {isSearching && (
        <p
          className="mt-2 px-1 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {resultCount === 0
            ? `Brak wynikow dla "${query}"`
            : resultCount === 1
              ? `1 wynik dla "${query}"`
              : `${resultCount} ${resultCount >= 2 && resultCount <= 4 ? 'wyniki' : 'wynikow'} dla "${query}"`}
        </p>
      )}
    </div>
  )
}

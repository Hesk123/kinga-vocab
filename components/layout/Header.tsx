'use client'

import { useState } from 'react'
import type { Language } from '@/lib/types'
import { getLanguageConfig } from '@/lib/constants'
import { LanguageSwitcher } from './LanguageSwitcher'

interface HeaderProps {
  lang: Language
  wordCount: number
}

export function Header({ lang, wordCount }: HeaderProps) {
  const [showSwitcher, setShowSwitcher] = useState(false)
  const config = getLanguageConfig(lang)

  const wordLabel = (() => {
    if (wordCount === 1) return 'slowo'
    if (wordCount >= 2 && wordCount <= 4) return 'slowa'
    return 'slow'
  })()

  return (
    <>
      <header
        className="sticky top-0 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--surface-elevated)',
          borderBottom: '1px solid var(--border-light)',
          zIndex: 'var(--z-header)',
          paddingTop: 'max(var(--safe-top), 12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Moj Slownik
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {wordCount > 0 && (
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: 'var(--text-muted)' }}
            >
              {wordCount} {wordLabel}
            </span>
          )}

          <button
            onClick={() => setShowSwitcher(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: `var(--lang-${lang}-light)`,
              color: `var(--lang-${lang})`,
            }}
            aria-label={`Aktualny jezyk: ${config.label}. Kliknij aby zmienic`}
          >
            <span className="text-base leading-none">{config.flag}</span>
            <span>{config.label}</span>
          </button>
        </div>
      </header>

      {showSwitcher && (
        <LanguageSwitcher
          currentLang={lang}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </>
  )
}

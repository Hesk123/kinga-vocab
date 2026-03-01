import type { Language, LanguageConfig, TabId } from './types'

export const LANGUAGES: readonly LanguageConfig[] = [
  { code: 'en', label: 'Angielski', flag: '\u{1F1EC}\u{1F1E7}', nativeName: 'English' },
  { code: 'de', label: 'Niemiecki', flag: '\u{1F1E9}\u{1F1EA}', nativeName: 'Deutsch' },
  { code: 'es', label: 'Hiszpa\u0144ski', flag: '\u{1F1EA}\u{1F1F8}', nativeName: 'Espa\u00F1ol' },
  { code: 'fr', label: 'Francuski', flag: '\u{1F1EB}\u{1F1F7}', nativeName: 'Fran\u00E7ais' },
  { code: 'it', label: 'W\u0142oski', flag: '\u{1F1EE}\u{1F1F9}', nativeName: 'Italiano' },
  { code: 'pt', label: 'Portugalski', flag: '\u{1F1F5}\u{1F1F9}', nativeName: 'Portugu\u00EAs' },
] as const

export const LANGUAGE_CODES: readonly Language[] = LANGUAGES.map((l) => l.code)

export function getLanguageConfig(code: Language): LanguageConfig {
  const config = LANGUAGES.find((l) => l.code === code)
  if (!config) {
    throw new Error(`Unknown language code: ${code}`)
  }
  return config
}

export function isValidLanguage(code: string): code is Language {
  return LANGUAGE_CODES.includes(code as Language)
}

export const STORAGE_KEYS = {
  vocabPrefix: 'vocab_',
  activeLang: 'active_lang',
  tutorialSeen: 'tutorial_seen',
} as const

export const TABS: readonly { id: TabId; label: string; href: string }[] = [
  { id: 'dictionary', label: 'S\u0142ownik', href: '' },
  { id: 'add', label: 'Dodaj', href: '/dodaj' },
  { id: 'import', label: 'Importuj', href: '/import' },
] as const

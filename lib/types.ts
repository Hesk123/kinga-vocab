export type Language = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt'

export interface VocabEntry {
  id: string
  polish: string
  translation: string
  example?: string
  addedAt: string
  source: 'manual' | 'ocr' | 'paste'
}

export interface VocabStore {
  [lang: string]: VocabEntry[]
}

export interface LanguageConfig {
  code: Language
  label: string
  flag: string
  nativeName: string
}

export type VocabAction =
  | { type: 'SET_ENTRIES'; entries: VocabEntry[] }
  | { type: 'ADD_ENTRIES'; entries: NewVocabEntry[] }
  | { type: 'REMOVE_ENTRY'; id: string }
  | { type: 'CLEAR_ALL' }

export type NewVocabEntry = Omit<VocabEntry, 'id' | 'addedAt'>

export type TabId = 'dictionary' | 'add' | 'import'

import type { Language, VocabEntry } from './types'
import { STORAGE_KEYS, isValidLanguage } from './constants'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function safeGetItem(key: string): string | null {
  if (!isClient()) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isClient()) return
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error('localStorage write failed:', error)
  }
}

function safeRemoveItem(key: string): void {
  if (!isClient()) return
  try {
    localStorage.removeItem(key)
  } catch {
    // silently fail
  }
}

// --- Vocab CRUD ---

export function getVocab(lang: Language): VocabEntry[] {
  const raw = safeGetItem(`${STORAGE_KEYS.vocabPrefix}${lang}`)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as VocabEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setVocab(lang: Language, entries: VocabEntry[]): void {
  safeSetItem(`${STORAGE_KEYS.vocabPrefix}${lang}`, JSON.stringify(entries))
}

export function clearVocab(lang: Language): void {
  safeRemoveItem(`${STORAGE_KEYS.vocabPrefix}${lang}`)
}

// --- Active Language ---

export function getActiveLang(): Language | null {
  const raw = safeGetItem(STORAGE_KEYS.activeLang)
  if (raw && isValidLanguage(raw)) {
    return raw
  }
  return null
}

export function setActiveLang(lang: Language): void {
  safeSetItem(STORAGE_KEYS.activeLang, lang)
}

// --- Tutorial ---

export function isTutorialSeen(): boolean {
  return safeGetItem(STORAGE_KEYS.tutorialSeen) === 'true'
}

export function markTutorialSeen(): void {
  safeSetItem(STORAGE_KEYS.tutorialSeen, 'true')
}

export function resetTutorial(): void {
  safeRemoveItem(STORAGE_KEYS.tutorialSeen)
}

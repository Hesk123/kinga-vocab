interface ParsedPair {
  polish: string
  translation: string
}

const SEPARATORS = [' - ', ': ', ' | ', '\t', ' = '] as const

function trySplitLine(line: string): ParsedPair | null {
  const trimmed = line.trim()

  // Skip empty lines, very short lines, and lines that look like headers/numbers
  if (trimmed.length < 3) return null
  if (/^\d+[.)]\s*$/.test(trimmed)) return null

  // Try each separator
  for (const sep of SEPARATORS) {
    const sepIndex = trimmed.indexOf(sep)
    if (sepIndex > 0) {
      const left = trimmed.substring(0, sepIndex).trim()
      const right = trimmed.substring(sepIndex + sep.length).trim()

      // Both parts need at least 1 character
      if (left.length >= 1 && right.length >= 1) {
        // Strip numbering prefix like "1. " or "1) " or "- "
        const cleanLeft = left.replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, '').trim()
        const cleanRight = right.replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, '').trim()

        if (cleanLeft.length >= 1 && cleanRight.length >= 1) {
          return {
            polish: cleanLeft,
            translation: cleanRight,
          }
        }
      }
    }
  }

  return null
}

export function parseWordList(text: string): ParsedPair[] {
  if (!text || typeof text !== 'string') return []

  const lines = text.split(/\r?\n/)
  const pairs: ParsedPair[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    const pair = trySplitLine(line)
    if (pair) {
      // Deduplicate within the pasted text itself
      const key = `${pair.polish.toLowerCase()}::${pair.translation.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        pairs.push(pair)
      }
    }
  }

  return pairs
}

export function findDuplicates(
  newPairs: ParsedPair[],
  existingEntries: Array<{ polish: string; translation: string }>
): Set<number> {
  const existingKeys = new Set(
    existingEntries.map(
      (e) => `${e.polish.toLowerCase().trim()}::${e.translation.toLowerCase().trim()}`
    )
  )

  const duplicateIndices = new Set<number>()
  newPairs.forEach((pair, index) => {
    const key = `${pair.polish.toLowerCase().trim()}::${pair.translation.toLowerCase().trim()}`
    if (existingKeys.has(key)) {
      duplicateIndices.add(index)
    }
  })

  return duplicateIndices
}

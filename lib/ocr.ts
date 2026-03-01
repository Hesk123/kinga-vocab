import OpenAI from 'openai'
import type { Language } from './types'
import { getLanguageConfig } from './constants'

interface ExtractedPair {
  polish: string
  translation: string
  example?: string
}

interface OcrResponse {
  pairs: ExtractedPair[]
}

function getClient(): OpenAI {
  const apiKey = process.env.NEXT_PUBLIC_KIMI_API_KEY
  if (!apiKey) {
    throw new Error('Brak klucza API Kimi. Ustaw NEXT_PUBLIC_KIMI_API_KEY w .env.local')
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.moonshot.ai/v1',
    dangerouslyAllowBrowser: true,
  })
}

function buildSystemPrompt(targetLang: Language): string {
  const langConfig = getLanguageConfig(targetLang)

  const examples: Record<string, string> = {
    de: `Example output:
{"pairs": [{"polish": "pies", "translation": "der Hund"}, {"polish": "jeść", "translation": "essen"}, {"polish": "szybki", "translation": "schnell"}, {"polish": "szkoła", "translation": "die Schule"}]}

For German nouns, ALWAYS add the article (der/die/das) before the noun.`,
    en: `Example output:
{"pairs": [{"polish": "pies", "translation": "dog"}, {"polish": "jeść", "translation": "to eat"}, {"polish": "szybki", "translation": "fast"}]}`,
    es: `Example output:
{"pairs": [{"polish": "pies", "translation": "el perro"}, {"polish": "jeść", "translation": "comer"}, {"polish": "szybki", "translation": "rápido"}]}`,
    fr: `Example output:
{"pairs": [{"polish": "pies", "translation": "le chien"}, {"polish": "jeść", "translation": "manger"}, {"polish": "szybki", "translation": "rapide"}]}`,
    it: `Example output:
{"pairs": [{"polish": "pies", "translation": "il cane"}, {"polish": "jeść", "translation": "mangiare"}, {"polish": "szybki", "translation": "veloce"}]}`,
    pt: `Example output:
{"pairs": [{"polish": "pies", "translation": "o cão"}, {"polish": "jeść", "translation": "comer"}, {"polish": "szybki", "translation": "rápido"}]}`,
  }

  return `You are a vocabulary extractor. A Polish student is learning ${langConfig.nativeName}.

Extract Polish-${langConfig.nativeName} vocabulary pairs from the image.

CRITICAL RULES:
1. The "polish" field MUST contain the POLISH word (Polish examples: pies, kot, dom, jeść, pisać, duży, szybko)
2. The "translation" field MUST contain the ${langConfig.nativeName} word
3. Extract ALL word types: nouns, verbs, adjectives, adverbs, phrases, expressions
4. Do NOT put ${langConfig.nativeName} words in the "polish" field — that field is ONLY for Polish
${targetLang === 'de' ? '5. For German nouns, ALWAYS add the article (der/die/das) before the noun\n' : ''}
${examples[targetLang] || examples.en}

Return ONLY this JSON format, no markdown, no explanation:
{"pairs": [{"polish": "...", "translation": "...", "example": "..."}]}`
}

function parseOcrResponse(content: string): ExtractedPair[] {
  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(content) as OcrResponse
    if (parsed.pairs && Array.isArray(parsed.pairs)) {
      return validatePairs(parsed.pairs)
    }
  } catch {
    // Fall through to extraction attempts
  }

  // Try extracting JSON from markdown code blocks
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch?.[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]) as OcrResponse
      if (parsed.pairs && Array.isArray(parsed.pairs)) {
        return validatePairs(parsed.pairs)
      }
    } catch {
      // Fall through
    }
  }

  // Try finding JSON object pattern in the response
  const jsonMatch = content.match(/\{[\s\S]*"pairs"[\s\S]*\}/)
  if (jsonMatch?.[0]) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as OcrResponse
      if (parsed.pairs && Array.isArray(parsed.pairs)) {
        return validatePairs(parsed.pairs)
      }
    } catch {
      // Fall through
    }
  }

  throw new Error('Nie udalo sie odczytac odpowiedzi z modelu AI')
}

function validatePairs(pairs: ExtractedPair[]): ExtractedPair[] {
  return pairs
    .filter((pair) => {
      return (
        typeof pair.polish === 'string' &&
        typeof pair.translation === 'string' &&
        pair.polish.trim().length >= 1 &&
        pair.translation.trim().length >= 1
      )
    })
    .map((pair) => ({
      polish: pair.polish.trim(),
      translation: pair.translation.trim(),
      example: pair.example?.trim() || undefined,
    }))
}

export async function extractVocabFromText(
  text: string,
  targetLang: Language
): Promise<ExtractedPair[]> {
  const client = getClient()
  const langConfig = getLanguageConfig(targetLang)

  const response = await client.chat.completions.create({
    model: 'moonshot-v1-128k-vision-preview',
    max_tokens: 4096,
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: (() => {
          const examples: Record<string, string> = {
            de: `Example output:
{"pairs": [{"polish": "pies", "translation": "der Hund"}, {"polish": "jeść", "translation": "essen"}, {"polish": "szybki", "translation": "schnell"}, {"polish": "szkoła", "translation": "die Schule"}]}

For German nouns, ALWAYS add the article (der/die/das) before the noun.`,
            en: `Example output:
{"pairs": [{"polish": "pies", "translation": "dog"}, {"polish": "jeść", "translation": "to eat"}, {"polish": "szybki", "translation": "fast"}]}`,
            es: `Example output:
{"pairs": [{"polish": "pies", "translation": "el perro"}, {"polish": "jeść", "translation": "comer"}, {"polish": "szybki", "translation": "rápido"}]}`,
            fr: `Example output:
{"pairs": [{"polish": "pies", "translation": "le chien"}, {"polish": "jeść", "translation": "manger"}, {"polish": "szybki", "translation": "rapide"}]}`,
            it: `Example output:
{"pairs": [{"polish": "pies", "translation": "il cane"}, {"polish": "jeść", "translation": "mangiare"}, {"polish": "szybki", "translation": "veloce"}]}`,
            pt: `Example output:
{"pairs": [{"polish": "pies", "translation": "o cão"}, {"polish": "jeść", "translation": "comer"}, {"polish": "szybki", "translation": "rápido"}]}`,
          }

          return `You are a vocabulary extractor. A Polish student is learning ${langConfig.nativeName}.

Extract Polish-${langConfig.nativeName} vocabulary pairs from the text below.

CRITICAL RULES:
1. The "polish" field MUST contain the POLISH word (Polish examples: pies, kot, dom, jeść, pisać, duży, szybko)
2. The "translation" field MUST contain the ${langConfig.nativeName} word
3. Extract ALL word types: nouns, verbs, adjectives, adverbs, phrases, expressions
4. Do NOT put ${langConfig.nativeName} words in the "polish" field — that field is ONLY for Polish
${targetLang === 'de' ? '5. For German nouns, ALWAYS add the article (der/die/das) before the noun\n' : ''}
${examples[targetLang] || examples.en}

Return ONLY this JSON format, no markdown, no explanation:
{"pairs": [{"polish": "...", "translation": "...", "example": "..."}]}`
        })(),
      },
      {
        role: 'user',
        content: `Extract all vocabulary pairs from this text:\n\n${text}`,
      },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Model AI nie zwrocil odpowiedzi')
  }

  return parseOcrResponse(content)
}

export async function extractVocab(
  base64Image: string,
  targetLang: Language
): Promise<ExtractedPair[]> {
  const client = getClient()

  // Ensure proper data URI format
  const imageUrl = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`

  const response = await client.chat.completions.create({
    model: 'moonshot-v1-128k-vision-preview',
    max_tokens: 2048,
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(targetLang),
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'Extract all vocabulary pairs from this image.',
          },
        ],
      },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Model AI nie zwrocil odpowiedzi')
  }

  return parseOcrResponse(content)
}

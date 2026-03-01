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

  const langExamples: Record<string, string> = {
    de: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "die Reise"},
  {"polish": "samochód", "translation": "das Auto"},
  {"polish": "jechać", "translation": "fahren"},
  {"polish": "szybki", "translation": "schnell"},
  {"polish": "lotnisko", "translation": "der Flughafen"},
  {"polish": "wygodny", "translation": "bequem"}
]}

For German nouns, ALWAYS include the article (der/die/das).`,
    en: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "journey"},
  {"polish": "samochód", "translation": "car"},
  {"polish": "jechać", "translation": "to drive"},
  {"polish": "szybki", "translation": "fast"},
  {"polish": "lotnisko", "translation": "airport"},
  {"polish": "wygodny", "translation": "comfortable"}
]}`,
    es: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "el viaje"},
  {"polish": "samochód", "translation": "el coche"},
  {"polish": "jechać", "translation": "conducir"},
  {"polish": "szybki", "translation": "rápido"}
]}`,
    fr: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "le voyage"},
  {"polish": "samochód", "translation": "la voiture"},
  {"polish": "jechać", "translation": "conduire"},
  {"polish": "szybki", "translation": "rapide"}
]}`,
    it: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "il viaggio"},
  {"polish": "samochód", "translation": "la macchina"},
  {"polish": "jechać", "translation": "guidare"},
  {"polish": "szybki", "translation": "veloce"}
]}`,
    pt: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "a viagem"},
  {"polish": "samochód", "translation": "o carro"},
  {"polish": "jechać", "translation": "conduzir"},
  {"polish": "szybki", "translation": "rápido"}
]}`,
  }

  return `You are a Polish-${langConfig.nativeName} dictionary. Your job is to find vocabulary in the image and TRANSLATE each word into Polish.

From the image, extract important vocabulary words and translate each one into Polish.

Output format - ONLY valid JSON:
{"pairs": [{"polish": "POLISH_TRANSLATION", "translation": "${langConfig.nativeName.toUpperCase()}_WORD"}]}

${langExamples[targetLang] || langExamples.en}

RULES:
- "polish" = Polish translation (MUST be in Polish, NOT in ${langConfig.nativeName})
- "translation" = ${langConfig.nativeName} word${targetLang === 'de' ? ' with article for nouns (der/die/das)' : ''}
- Include nouns, verbs, adjectives, adverbs, useful phrases
- You MUST translate every word to Polish. If "polish" contains a ${langConfig.nativeName} word, that is WRONG.
- Return ONLY JSON, no markdown, no explanation`
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
          const langExamples: Record<string, string> = {
            de: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "die Reise"},
  {"polish": "samochód", "translation": "das Auto"},
  {"polish": "jechać", "translation": "fahren"},
  {"polish": "szybki", "translation": "schnell"},
  {"polish": "lotnisko", "translation": "der Flughafen"},
  {"polish": "wygodny", "translation": "bequem"}
]}

For German nouns, ALWAYS include the article (der/die/das).`,
            en: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "journey"},
  {"polish": "samochód", "translation": "car"},
  {"polish": "jechać", "translation": "to drive"},
  {"polish": "szybki", "translation": "fast"}
]}`,
            es: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "el viaje"},
  {"polish": "samochód", "translation": "el coche"},
  {"polish": "jechać", "translation": "conducir"},
  {"polish": "szybki", "translation": "rápido"}
]}`,
            fr: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "le voyage"},
  {"polish": "samochód", "translation": "la voiture"},
  {"polish": "jechać", "translation": "conduire"},
  {"polish": "szybki", "translation": "rapide"}
]}`,
            it: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "il viaggio"},
  {"polish": "samochód", "translation": "la macchina"},
  {"polish": "jechać", "translation": "guidare"},
  {"polish": "szybki", "translation": "veloce"}
]}`,
            pt: `EXAMPLES of correct output:
{"pairs": [
  {"polish": "podróż", "translation": "a viagem"},
  {"polish": "samochód", "translation": "o carro"},
  {"polish": "jechać", "translation": "conduzir"},
  {"polish": "szybki", "translation": "rápido"}
]}`,
          }

          return `You are a Polish-${langConfig.nativeName} dictionary. Your job is to find vocabulary in the text and TRANSLATE each word into Polish.

From the text below, extract important vocabulary words and translate each one into Polish.

Output format - ONLY valid JSON:
{"pairs": [{"polish": "POLISH_TRANSLATION", "translation": "${langConfig.nativeName.toUpperCase()}_WORD"}]}

${langExamples[targetLang] || langExamples.en}

RULES:
- "polish" = Polish translation (MUST be in Polish, NOT in ${langConfig.nativeName})
- "translation" = ${langConfig.nativeName} word${targetLang === 'de' ? ' with article for nouns (der/die/das)' : ''}
- Include nouns, verbs, adjectives, adverbs, useful phrases
- You MUST translate every word to Polish. If "polish" contains a ${langConfig.nativeName} word, that is WRONG.
- Return ONLY JSON, no markdown, no explanation`
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

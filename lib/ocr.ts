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
  return `You are a vocabulary extractor for a Polish language learner. The user's NATIVE language is POLISH. They are learning ${langConfig.nativeName}.

CRITICAL: Every pair MUST have one side in POLISH and the other in ${langConfig.nativeName}. NEVER return pairs where both sides are the same language.

Return ONLY valid JSON in this exact format:
{"pairs": [{"polish": "...", "translation": "...", "example": "..."}]}

Rules:
- "polish" = the POLISH word or phrase (this MUST be in Polish language)
- "translation" = the ${langConfig.nativeName} translation (this MUST be in ${langConfig.nativeName})
- "example" = an optional example sentence in ${langConfig.nativeName} (include only if visible in the image)
- If words appear in ${langConfig.nativeName} only, provide the Polish translation yourself
- If words appear in Polish only, provide the ${langConfig.nativeName} translation yourself
${targetLang === 'de' ? `- GERMAN ARTICLES: For ALL German nouns, ALWAYS include the article (der/die/das) before the noun. Example: "der Hund", "die Katze", "das Haus". This is mandatory for every noun.\n` : ''}- Ignore page numbers, exercise instructions, headers, and non-vocabulary content
- Clean up any OCR artifacts (fix obvious typos in extracted text)
- If you cannot find any vocabulary pairs, return {"pairs": []}
- Return ONLY the JSON object, no markdown, no explanation`
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
        content: `You are a vocabulary extractor for a Polish language learner. The user's NATIVE language is POLISH. They are learning ${langConfig.nativeName}.

CRITICAL: Every pair MUST have one side in POLISH and the other in ${langConfig.nativeName}. NEVER return pairs where both sides are the same language.

Return ONLY valid JSON in this exact format:
{"pairs": [{"polish": "...", "translation": "...", "example": "..."}]}

Rules:
- "polish" = the POLISH word or phrase (this MUST be in Polish language)
- "translation" = the ${langConfig.nativeName} translation (this MUST be in ${langConfig.nativeName})
- "example" = an optional example sentence in ${langConfig.nativeName} (include only if present in the text)
- If words appear in ${langConfig.nativeName} only, provide the Polish translation yourself
- If words appear in Polish only, provide the ${langConfig.nativeName} translation yourself
${targetLang === 'de' ? `- GERMAN ARTICLES: For ALL German nouns, ALWAYS include the article (der/die/das) before the noun. Example: "der Hund", "die Katze", "das Haus". This is mandatory for every noun.\n` : ''}- Ignore page numbers, exercise instructions, headers, and non-vocabulary content
- If text contains vocabulary lists, word tables, or flashcard-style content, extract ALL pairs
- If text is a lesson or article, extract key vocabulary terms with their translations
- Clean up any formatting artifacts
- If you cannot find any vocabulary pairs, return {"pairs": []}
- Return ONLY the JSON object, no markdown, no explanation`,
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

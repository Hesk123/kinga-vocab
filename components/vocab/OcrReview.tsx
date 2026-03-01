'use client'

import { ImportReview } from './ImportReview'

interface ReviewPair {
  polish: string
  translation: string
  example?: string
}

interface OcrReviewProps {
  pairs: ReviewPair[]
  onAdd: (selected: ReviewPair[]) => void
  onBack: () => void
}

export function OcrReview({ pairs, onAdd, onBack }: OcrReviewProps) {
  return (
    <ImportReview
      pairs={pairs}
      onAdd={onAdd}
      onBack={onBack}
      addButtonLabel={`Dodaj zaznaczone (${pairs.length})`}
      showExamples={true}
    />
  )
}

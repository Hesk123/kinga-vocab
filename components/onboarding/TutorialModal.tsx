'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorial } from '@/hooks/useTutorial'

interface TutorialSlide {
  icon: string
  title: string
  description: string
}

const SLIDES: TutorialSlide[] = [
  {
    icon: '\u{1F44B}',
    title: 'Witaj w Moim S\u0142owniku!',
    description:
      'Tw\u00F3j osobisty mened\u017Cer s\u0142\u00F3wek. Ucz si\u0119 j\u0119zyk\u00F3w w prosty spos\u00F3b.',
  },
  {
    icon: '\u{1F4DA}',
    title: 'Twoje s\u0142\u00F3wka, zawsze pod r\u0119k\u0105',
    description:
      'Przegl\u0105daj s\u0142\u00F3wka alfabetycznie, szukaj i zarz\u0105dzaj swoj\u0105 kolekcj\u0105.',
  },
  {
    icon: '\u{1F4F7}',
    title: 'Dodaj ze zdj\u0119cia',
    description:
      'Zr\u00F3b zdj\u0119cie \u0107wiczenia, a aplikacja automatycznie rozpozna s\u0142\u00F3wka.',
  },
  {
    icon: '\u{1F4CB}',
    title: 'Wklej list\u0119',
    description:
      'Wklej gotow\u0105 list\u0119 s\u0142\u00F3wek \u2014 aplikacja sama sprawdzi duplikaty.',
  },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 } as const,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 } as const,
  },
} as const

function SlideIllustration({ icon }: { icon: string }) {
  return (
    <div
      className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
      style={{ background: 'var(--primary-light)' }}
    >
      <span className="text-5xl leading-none" role="img">
        {icon}
      </span>
    </div>
  )
}

export function TutorialModal() {
  const { shouldShow, dismiss } = useTutorial()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const isLastSlide = currentSlide === SLIDES.length - 1

  const goToNext = useCallback(() => {
    if (isLastSlide) {
      dismiss()
    } else {
      setDirection(1)
      setCurrentSlide((prev) => prev + 1)
    }
  }, [isLastSlide, dismiss])

  const goToPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide((prev) => prev - 1)
    }
  }, [currentSlide])

  if (!shouldShow) return null

  const slide = SLIDES[currentSlide]

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 'var(--z-modal-backdrop)',
            background: 'oklch(0% 0 0 / 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => {
            // Only dismiss if clicking backdrop directly
            if (e.target === e.currentTarget) dismiss()
          }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden"
            style={{
              background: 'var(--surface-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 'var(--z-modal)',
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Skip button */}
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 z-10 rounded-lg px-2 py-1 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Pomi\u0144 samouczek"
            >
              Pomi\u0144
            </button>

            {/* Slide content */}
            <div className="px-6 pb-6 pt-12">
              <div className="relative h-[220px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                  >
                    <SlideIllustration icon={slide.icon} />

                    <h2
                      className="mt-5 text-xl font-bold"
                      style={{ color: 'var(--text)' }}
                    >
                      {slide.title}
                    </h2>

                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {slide.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 py-4">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentSlide ? 1 : -1)
                      setCurrentSlide(index)
                    }}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      width: index === currentSlide ? 24 : 8,
                      height: 8,
                      borderRadius: 'var(--radius-full)',
                      background:
                        index === currentSlide
                          ? 'var(--primary)'
                          : 'var(--border)',
                    }}
                    aria-label={`Przejd\u017A do slajdu ${index + 1}`}
                    aria-current={index === currentSlide ? 'step' : undefined}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3">
                {currentSlide > 0 && (
                  <motion.button
                    onClick={goToPrev}
                    className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--text-secondary)',
                    }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    aria-label="Poprzedni slajd"
                  >
                    Wstecz
                  </motion.button>
                )}

                <motion.button
                  onClick={goToNext}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors cursor-pointer"
                  style={{
                    background: 'var(--primary)',
                  }}
                  whileHover={{
                    background: 'var(--primary-hover)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  aria-label={
                    isLastSlide ? 'Zamknij samouczek' : 'Nast\u0119pny slajd'
                  }
                >
                  {isLastSlide ? 'Zaczynamy!' : 'Nast\u0119pne'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

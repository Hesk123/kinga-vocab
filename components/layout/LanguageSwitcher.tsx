'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LANGUAGES } from '@/lib/constants'
import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/lib/types'

interface LanguageSwitcherProps {
  currentLang: Language
  onClose: () => void
}

export function LanguageSwitcher({ currentLang, onClose }: LanguageSwitcherProps) {
  const { switchLanguage } = useLanguage()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  function handleSelect(code: Language) {
    if (code !== currentLang) {
      switchLanguage(code)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0"
        style={{
          background: 'oklch(0% 0 0 / 0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 'var(--z-modal-backdrop)',
        }}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="mx-4 mt-16 overflow-hidden rounded-2xl"
          style={{
            background: 'var(--surface-elevated)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 'var(--z-modal)',
            borderRadius: 'var(--radius-xl)',
          }}
          role="dialog"
          aria-label="Wybierz jezyk"
        >
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              Zmien jezyk
            </h2>
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === currentLang
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className="flex w-full items-center gap-3 px-4 py-3 transition-colors cursor-pointer"
                  style={{
                    background: isActive ? 'var(--primary-lightest)' : 'transparent',
                  }}
                >
                  <span className="text-2xl leading-none">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: isActive ? 'var(--primary)' : 'var(--text)',
                      }}
                    >
                      {lang.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {lang.nativeName}
                    </div>
                  </div>
                  {isActive && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--primary)' }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          <div
            className="border-t px-4 py-3"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <button
              onClick={onClose}
              className="w-full rounded-xl py-2.5 text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
              }}
            >
              Anuluj
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

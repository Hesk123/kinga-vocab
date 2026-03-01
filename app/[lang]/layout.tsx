'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { isValidLanguage } from '@/lib/constants'
import { setActiveLang } from '@/lib/storage'
import { useVocab } from '@/hooks/useVocab'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Toast } from '@/components/ui/Toast'
import { ToastProvider } from '@/context/ToastContext'
import { TutorialModal } from '@/components/onboarding/TutorialModal'
import type { Language } from '@/lib/types'

interface LangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  const { lang: langParam } = use(params)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Validate language param
  const isValid = isValidLanguage(langParam)
  const lang = isValid ? (langParam as Language) : 'en'

  useEffect(() => {
    if (!isValid) {
      router.replace('/')
      return
    }
    setActiveLang(lang)
    setMounted(true)
  }, [isValid, lang, router])

  // Get word count for header
  const { count } = useVocab(lang)

  if (!isValid || !mounted) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: 'var(--bg)' }}
      />
    )
  }

  return (
    <ToastProvider>
      <div
        className="flex min-h-dvh flex-col"
        style={{ background: 'var(--bg)' }}
      >
        <Header lang={lang} wordCount={count} />

        <AnimatePresence mode="wait">
          <motion.main
            key={lang}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 pb-20"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        <BottomNav lang={lang} />
        <Toast />
        <TutorialModal />
      </div>
    </ToastProvider>
  )
}

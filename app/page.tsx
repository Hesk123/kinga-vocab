'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LANGUAGES } from '@/lib/constants'
import { getActiveLang, setActiveLang } from '@/lib/storage'
import type { Language } from '@/lib/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = getActiveLang()
    if (stored) {
      router.replace(`/${stored}`)
    }
  }, [router])

  function handleSelectLanguage(code: Language) {
    setActiveLang(code)
    router.push(`/${code}`)
  }

  // While checking for stored language, show nothing (prevents flash)
  if (!mounted) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center"
        style={{ background: 'var(--bg)' }}
      />
    )
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-10 text-center"
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: 'var(--primary-light)' }}
        >
          {'\u{1F4DA}'}
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Moj Slownik
        </h1>
        <p
          className="mt-2 text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          Wybierz jezyk do nauki
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid w-full max-w-sm grid-cols-2 gap-3"
      >
        {LANGUAGES.map((lang) => (
          <motion.button
            key={lang.code}
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectLanguage(lang.code)}
            className="flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center transition-shadow cursor-pointer"
            style={{
              background: 'var(--surface-elevated)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span className="text-4xl leading-none">{lang.flag}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text)' }}
            >
              {lang.label}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang.nativeName}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </main>
  )
}

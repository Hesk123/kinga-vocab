'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Language, TabId } from '@/lib/types'

interface BottomNavProps {
  lang: Language
}

interface TabConfig {
  id: TabId
  label: string
  href: string
  icon: React.ReactNode
}

function DictionaryIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h4" />
    </svg>
  )
}

function AddIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}

function ImportIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function getActiveTab(pathname: string, lang: Language): TabId {
  if (pathname.includes('/dodaj')) return 'add'
  if (pathname.includes('/import')) return 'import'
  return 'dictionary'
}

export function BottomNav({ lang }: BottomNavProps) {
  const pathname = usePathname()
  const activeTab = getActiveTab(pathname, lang)

  const tabs: TabConfig[] = [
    {
      id: 'dictionary',
      label: 'Slownik',
      href: `/${lang}`,
      icon: <DictionaryIcon active={activeTab === 'dictionary'} />,
    },
    {
      id: 'add',
      label: 'Dodaj',
      href: `/${lang}/dodaj`,
      icon: <AddIcon active={activeTab === 'add'} />,
    },
    {
      id: 'import',
      label: 'Importuj',
      href: `/${lang}/import`,
      icon: <ImportIcon active={activeTab === 'import'} />,
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t"
      style={{
        background: 'var(--surface-elevated)',
        borderColor: 'var(--border-light)',
        zIndex: 'var(--z-nav)',
        paddingBottom: 'max(var(--safe-bottom), 8px)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="relative flex flex-col items-center gap-0.5 px-4 py-2 touch-target"
            style={{
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-px left-2 right-2 h-0.5 rounded-full"
                style={{ background: 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="flex items-center justify-center">
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

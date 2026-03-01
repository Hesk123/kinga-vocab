'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/context/ToastContext'

export function Toast() {
  const { toast } = useToast()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 28,
            }}
            className="pointer-events-auto rounded-full px-5 py-2.5 text-sm font-medium text-white"
            style={{
              background: 'var(--primary)',
              boxShadow: 'var(--shadow-lg)',
            }}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

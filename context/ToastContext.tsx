'use client'

import { createContext, useContext, useCallback, useState } from 'react'

interface ToastState {
  message: string
  id: number
}

interface ToastContextValue {
  toast: ToastState | null
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToast({ message, id })

    setTimeout(() => {
      setToast((current) => {
        if (current?.id === id) return null
        return current
      })
    }, 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

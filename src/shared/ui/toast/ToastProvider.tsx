import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckIcon } from '../icons'

interface Toast {
  id: number
  message: string
}

interface ToastValue {
  success(message: string): void
}

const ToastContext = createContext<ToastValue>({ success: () => undefined })

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const success = useCallback((message: string) => {
    const id = nextId.current++
    setToasts((list) => [...list, { id, message }])
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id))
    }, AUTO_DISMISS_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ success }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast toast-success" key={t.id} role="status">
            <CheckIcon />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  return useContext(ToastContext)
}

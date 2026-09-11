import React from 'react'
import type { ToastMessage } from '../types'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </span>
          <span className="toast-text">{toast.text}</span>
          <button className="toast-close" onClick={() => onRemove(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

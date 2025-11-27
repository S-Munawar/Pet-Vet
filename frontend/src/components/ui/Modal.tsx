import React from 'react'

const Modal = ({ title, children, open, onClose }: { title?: string; children: React.ReactNode; open: boolean; onClose?: () => void }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-md">✕</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal

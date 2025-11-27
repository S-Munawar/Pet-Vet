import React from 'react'

const Toast = ({ message, type = 'info' }: { message: string; type?: 'info' | 'success' | 'error' }) => {
  const color = type === 'success' ? 'bg-green-100 text-green-800' : type === 'error' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-6 right-6 p-3 rounded-md shadow ${color}`}>
      {message}
    </div>
  )
}

export default Toast

import React from 'react'

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative group inline-block">
    {children}
    <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded px-2 py-1">
      {label}
    </div>
  </div>
)

export default Tooltip

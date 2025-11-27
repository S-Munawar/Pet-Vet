import React from 'react'

const Skeleton = ({ width = 'w-full', height = 'h-6' }: { width?: string; height?: string }) => (
  <div className={`bg-slate-200/60 animate-pulse rounded ${width} ${height}`} aria-hidden />
)

export default Skeleton

import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-white/50 border-t">
      <div className="container py-4 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Pet-Vet. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer

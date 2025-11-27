import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const NavbarEnhanced = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 w-full z-40 transition-shadow ${scrolled ? 'backdrop-blur-lg bg-white/60 dark:bg-slate-900/60 shadow-sm' : 'bg-transparent'}`} aria-label="Main navigation">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white">Pet-Vet</Link>

        <nav className="hidden md:flex items-center gap-4" aria-label="Primary">
          <Link to="/" className="text-slate-700 hover:text-slate-900">Home</Link>
          <Link to="/about" className="text-slate-700 hover:text-slate-900">About</Link>
          <Link to="/consult" className="text-slate-700 hover:text-slate-900">Consult</Link>
          <Link to="/ai" className="text-slate-700 hover:text-slate-900">AI Advisor</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm px-3 py-2 rounded-md hover:bg-slate-100">Sign in</Link>
          <Link to="/register" className="text-sm bg-warm-accent-500 text-white px-3 py-2 rounded-md hover:bg-warm-accent-600">Sign up</Link>
          <div className="relative">
            <button aria-haspopup="true" aria-expanded="false" className="ml-3 p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2"> 
              <span className="sr-only">Open user menu</span>
              <img src="/vite.svg" alt="avatar" className="w-8 h-8 rounded-full border" />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="p-2 rounded-md focus:outline-none focus:ring-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-in mobile menu */}
      <div className={`md:hidden transition-transform ${open ? 'translate-y-0' : '-translate-y-full'} origin-top`}> 
        <div className="bg-white dark:bg-slate-900 shadow-md border-t">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block text-slate-700">Home</Link>
            <Link to="/about" className="block text-slate-700">About</Link>
            <Link to="/consult" className="block text-slate-700">Consult</Link>
            <Link to="/ai" className="block text-slate-700">AI Advisor</Link>
            <div className="pt-2 border-t">
              <Link to="/login" className="block text-center py-2">Sign in</Link>
              <Link to="/register" className="block text-center py-2 bg-warm-accent-500 text-white rounded-md">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavbarEnhanced

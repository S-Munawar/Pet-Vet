import React from 'react'
import { Link } from 'react-router-dom'

const LandingHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-vet-blue-400 to-vet-green-200 dark:from-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">Better care for pets, powered by smart health analysis</h1>
            <p className="text-lg text-slate-700 dark:text-slate-300 max-w-xl">Track health metrics, consult vets, and get AI-backed advice tailored for your pet. Trusted by clinics and pet owners worldwide.</p>

            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 bg-warm-accent-500 hover:bg-warm-accent-600 text-white px-5 py-3 rounded-lg shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-4 focus:ring-warm-accent-200">
                Get Started
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 bg-white/90 hover:bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 px-5 py-3 rounded-lg shadow-sm transition transform hover:-translate-y-0.5">Learn More</Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg shadow">
                <h4 className="text-sm font-semibold">24/7 Monitoring</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Real-time health trends</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg shadow">
                <h4 className="text-sm font-semibold">Vet Network</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Connect with professionals</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg shadow">
                <h4 className="text-sm font-semibold">AI Insights</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Personalized recommendations</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-80 sm:h-96 lg:h-80 bg-gradient-to-tr from-white to-transparent rounded-3xl shadow-xl flex items-center justify-center">
              {/* Placeholder pet illustration - replace with actual SVG or image */}
              <svg className="w-56 h-56" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="url(#g1)" opacity="0.12" />
                <path d="M60 120c10-30 40-40 60-20s30 40 10 50c-20 10-60 10-90-20 0 0 10-10 20-10z" fill="#fff" opacity="0.95" />
              </svg>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 card">
                <h5 className="font-semibold text-slate-900">Trusted by Clinics</h5>
                <p className="text-xs text-slate-600">Over 120 vet clinics rely on our platform.</p>
              </div>
              <div className="p-4 card">
                <h5 className="font-semibold text-slate-900">High Accuracy</h5>
                <p className="text-xs text-slate-600">AI models trained on clinical datasets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials / Trust indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <p className="text-slate-700">"Pet-Vet helped us catch a health issue early — saved our patient."</p>
            <div className="mt-3 text-xs text-slate-500">— Dr. Emily R., Small Animals Clinic</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <p className="text-slate-700">"Easy to use and integrates with our practice workflows."</p>
            <div className="mt-3 text-xs text-slate-500">— Clinic Admin</div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <p className="text-slate-700">"The AI suggestions are impressively accurate."</p>
            <div className="mt-3 text-xs text-slate-500">— Pet Owner</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHero

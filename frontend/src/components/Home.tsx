import React from 'react'
import { Link } from 'react-router-dom'
import AuthTest from './AuthTest'

const Home = () => {
  return (
    <div className="container">
      <div className="mt-8">
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold">Welcome to Pet-Vet</h1>
          <p className="mt-2 text-sm opacity-90">Your pet's health, simplified. Manage pets, consult vets, and get AI advice.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/add-pet" className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold">Add Pet</Link>
            <Link to="/consult" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md">Consult a Vet</Link>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="font-semibold text-slate-900">Pet Management</h3>
            <p className="text-sm text-slate-600 mt-2">Add and manage pets, view histories, and track health.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-900">Consultations</h3>
            <p className="text-sm text-slate-600 mt-2">Schedule vet visits and keep in touch with professionals.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-900">AI Advisor</h3>
            <p className="text-sm text-slate-600 mt-2">Ask the AI for care recommendations and preliminary analysis.</p>
          </div>
        </section>
        <AuthTest />
      </div>
    </div>
  )
}

export default Home

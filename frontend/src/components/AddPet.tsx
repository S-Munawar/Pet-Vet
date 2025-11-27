import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const AddPet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [age, setAge] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) {
      const newTok = await refreshAccessToken()
      if (!newTok) return
    }

    const tokenToUse = accessToken || (await refreshAccessToken())

    const res = await fetch(`${import.meta.env.VITE_API_URL}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenToUse}`,
      },
      body: JSON.stringify({ name, species, age }),
    })
    console.log('Pet added:', await res.json())
  }

  return (
    <div className="container">
      <div className="max-w-lg mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Add a new pet</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="pet-name" className="block text-sm text-slate-700 mb-1">Pet Name</label>
            <input id="pet-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label htmlFor="species" className="block text-sm text-slate-700 mb-1">Species</label>
            <input id="species" value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm text-slate-700 mb-1">Age</label>
            <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Add Pet</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPet

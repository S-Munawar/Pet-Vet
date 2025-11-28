import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const AddPet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const catBreeds = [
    'Siamese',
    'Persian',
    'Maine Coon',
    'Bengal',
    'Sphynx',
    'Domestic Shorthair',
    'Ragdoll',
    'Scottish Fold',
    'Other',
  ]

  const dogBreeds = [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'French Bulldog',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Other',
  ]

  const getBreedOptions = () => {
    if (species === 'cat') return catBreeds
    if (species === 'dog') return dogBreeds
    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!name.trim()) {
      setError('Pet name is required')
      return
    }
    if (!species) {
      setError('Species is required')
      return
    }
    if (!breed) {
      setError('Breed is required')
      return
    }
    if (!dateOfBirth) {
      setError('Date of birth is required')
      return
    }

    try {
      if (!accessToken) {
        const newTok = await refreshAccessToken()
        if (!newTok) {
          setError('Authentication failed')
          return
        }
      }

      const tokenToUse = accessToken || (await refreshAccessToken())

      const res = await fetch(`${import.meta.env.VITE_API_URL}/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify({ name, species, breed, dateOfBirth }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Failed to add pet:', res.status, text)
        setError(`Failed to add pet: ${res.status}`)
        return
      }

      const created = await res.json()
      console.log('Pet added:', created)
      setSuccess('Pet added successfully!')
      setName('')
      setSpecies('')
      setBreed('')
      setDateOfBirth('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="container">
      <div className="max-w-lg mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Add a new pet</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="pet-name" className="block text-sm text-slate-700 mb-1">
              Pet Name <span className="text-red-500">*</span>
            </label>
            <input
              id="pet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fluffy"
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="species" className="block text-sm text-slate-700 mb-1">
              Species <span className="text-red-500">*</span>
            </label>
            <select
              id="species"
              value={species}
              onChange={(e) => {
                setSpecies(e.target.value)
                setBreed('') // Reset breed when species changes
              }}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select species</option>
              <option value="cat">Cat</option>
              <option value="dog">Dog</option>
            </select>
          </div>

          {species && (
            <div>
              <label htmlFor="breed" className="block text-sm text-slate-700 mb-1">
                Breed <span className="text-red-500">*</span>
              </label>
              <select
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select breed</option>
                {getBreedOptions().map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm text-slate-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="reset"
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
              onClick={() => {
                setName('')
                setSpecies('')
                setBreed('')
                setDateOfBirth('')
                setError('')
                setSuccess('')
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPet

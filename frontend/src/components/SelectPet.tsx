import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

type Pet = {
  _id: string
  name: string
  species: string
  dateOfBirth?: string
  owner_id?: string
  ownerName?: string | null
  ownerEmail?: string | null
}

const SelectPet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!accessToken) {
          const newTok = await refreshAccessToken()
          if (!newTok) {
            setError('Unable to obtain access token')
            setLoading(false)
            return
          }
        }

        const tokenToUse = accessToken || (await refreshAccessToken())

        const params = new URLSearchParams()
        if (search) params.set('q', search)

        const res = await fetch(`${import.meta.env.VITE_API_URL}/pets?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        })

        if (!res.ok) {
          let msg = await res.text()
          try { msg = JSON.parse(msg).message || msg } catch {
            /* ignore parse errors */
          }
          setError(msg || `Request failed: ${res.status}`)
          setPets([])
          setLoading(false)
          return
        }

        const data = await res.json()
        setPets(Array.isArray(data) ? data : data?.data ?? [])
      } catch (err: unknown) {
        let message = String(err)
        if (typeof err === 'object' && err !== null && 'message' in err) {
          const m = (err as { message?: unknown }).message
          if (typeof m === 'string') message = m
        }
        setError(message)
        setPets([])
      } finally {
        setLoading(false)
      }
    }

    const t = setTimeout(() => { fetchPets() }, 250)
    return () => clearTimeout(t)
  }, [accessToken, refreshAccessToken, search])

  const navigate = useNavigate()

  return (
    <div className="container">
      <div className="max-w-lg mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Pets</h2>

        <div className="mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pets by name..." className="w-full border rounded-md px-3 py-2" />
        </div>

        {loading && <div className="p-3">Loading…</div>}
        {error && <div className="p-3 text-red-600">{error}</div>}

        {!loading && !error && (
          <ul className="space-y-3">
            {pets.length === 0 && <li className="p-3 bg-slate-50 border rounded-md">No pets found.</li>}
            {pets.map((pet) => {
              // compute age in years (approx)
              const dob = pet.dateOfBirth ? new Date(pet.dateOfBirth) : null
              const ageYears = dob ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
              return (
                <li key={pet._id} className="p-3 bg-slate-50 border rounded-md">
                  <div className="font-medium">{pet.name}</div>
                  <div className="text-sm text-slate-500">{pet.species} {ageYears !== null ? `• ${ageYears}y` : ''}</div>
                  <div className="text-xs text-slate-400">DOB: {dob ? dob.toLocaleDateString() : '—'}</div>
                  {pet.ownerName && <div className="text-xs text-slate-400">Owner: {pet.ownerName} {pet.ownerEmail ? `(${pet.ownerEmail})` : ''}</div>}
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => navigate(`/analyze?petId=${pet._id}`)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">Analyze</button>
                    <button onClick={() => navigate(`/history?petId=${pet._id}`)} className="text-sm bg-gray-200 px-3 py-1 rounded-md">History</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SelectPet

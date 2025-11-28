import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

type Vet = {
  _id: string
  name: string
  specialization?: string
  clinicName?: string
}

const ConsultVet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [vets, setVets] = useState<Vet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVets = async () => {
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

        const res = await fetch(`${import.meta.env.VITE_API_URL}/vets`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        })

        if (!res.ok) {
          // Try to read error message from JSON
          let msg = await res.text()
          try {
            const j = JSON.parse(msg)
            msg = j.message || j.error || msg
          } catch (e) {
            console.error('Failed to parse error message JSON:', e)
          }
          setError(msg || `Request failed: ${res.status}`)
          setVets([])
          setLoading(false)
          return
        }

        const data = await res.json()

        // backend may return either an array or a wrapper { success,message,data }
        const vetsArr: Vet[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : data?.vets ?? []

        setVets(vetsArr)
      } catch (e) {
        setError(String(e))
        setVets([])
      } finally {
        setLoading(false)
      }
    }

    fetchVets()
  }, [accessToken, refreshAccessToken])

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">Consult a Vet</h2>
        <p className="text-sm text-slate-600">Select a vet and schedule a consultation.</p>

        {loading && <p className="mt-4 text-sm text-slate-600">Loading vets…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {vets.length === 0 && <div className="p-4 border rounded-md">No vets available.</div>}
            {vets.map((vet) => (
              <div key={vet._id} className="p-4 border rounded-md">
                <div className="font-medium">{vet.name}</div>
                <div className="text-sm text-slate-500">{vet.specialization || vet.clinicName || 'General'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsultVet

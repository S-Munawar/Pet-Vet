import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const ConsultVet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [vets, setVets] = useState([])

  useEffect(() => {
    const fetchVets = async () => {
      if (!accessToken) {
        const newTok = await refreshAccessToken()
        if (!newTok) return
      }

      const tokenToUse = accessToken || (await refreshAccessToken())

      const res = await fetch(`${import.meta.env.VITE_API_URL}/vets`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })
      const data = await res.json()
      setVets(data)
    }

    fetchVets()
  }, [accessToken, refreshAccessToken])

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">Consult a Vet</h2>
        <p className="text-sm text-slate-600">Select a vet and schedule a consultation.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {vets.map((vet: any) => (
            <div key={vet.id} className="p-4 border rounded-md">{vet.name} — <span className="text-sm text-slate-500">{vet.specialization}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConsultVet

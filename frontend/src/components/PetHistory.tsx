import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const PetHistory = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken) {
        const newTok = await refreshAccessToken()
        if (!newTok) return
      }

      const tokenToUse = accessToken || (await refreshAccessToken())

      const res = await fetch(`${import.meta.env.VITE_API_URL}/pets/history`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })
      const data = await res.json()
      setHistory(data)
    }

    fetchHistory()
  }, [accessToken, refreshAccessToken])

  return (
    <div className="container">
      <div className="max-w-3xl mx-auto mt-8 card">
        <h1 className="text-2xl font-semibold">Pet History</h1>
        <div className="mt-4">
          <p className="text-sm text-slate-600">Visit records and medical history for the selected pet.</p>
          <ul className="mt-3 space-y-2">
            {history.map((record: any) => (
              <li key={record.id} className="p-3 border rounded-md">{record.date} — {record.type}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PetHistory

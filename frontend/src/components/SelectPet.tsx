import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const SelectPet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [pets, setPets] = useState([])

  useEffect(() => {
    const fetchPets = async () => {
      if (!accessToken) {
        const newTok = await refreshAccessToken()
        if (!newTok) return
      }

      const tokenToUse = accessToken || (await refreshAccessToken())

      const res = await fetch(`${import.meta.env.VITE_API_URL}/pets`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })
      const data = await res.json()
      setPets(data)
    }

    fetchPets()
  }, [accessToken, refreshAccessToken])

  return (
    <div className="container">
      <div className="max-w-lg mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Pets</h2>
        <ul className="space-y-3">
          {pets.map((pet: any) => (
            <li key={pet.id} className="p-3 bg-slate-50 border rounded-md">{pet.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SelectPet

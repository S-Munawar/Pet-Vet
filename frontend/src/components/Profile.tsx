import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const { user, accessToken, refreshAccessToken } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) {
        const newTok = await refreshAccessToken()
        if (!newTok) return
      }

      const tokenToUse = accessToken || (await refreshAccessToken())

      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })
      const data = await res.json()
      setProfile(data)
    }

    fetchProfile()
  }, [accessToken, refreshAccessToken])

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto mt-8 card">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <div className="mt-4">
          <p className="text-sm text-slate-600">User information and settings.</p>
          {profile && (
            <div className="mt-4">
              <p>Name: {(profile as any).name}</p>
              <p>Email: {(profile as any).email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

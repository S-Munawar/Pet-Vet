import React from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthTest = () => {
  const { user, accessToken, loading } = useAuth()
  
  return (
    <div style={{ padding: '20px', border: '1px solid red', margin: '10px' }}>
      <h3>Auth Debug Info:</h3>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>User: {user ? JSON.stringify(user) : 'null'}</p>
      <p>Access Token: {accessToken ? 'exists' : 'null'}</p>
    </div>
  )
}

export default AuthTest
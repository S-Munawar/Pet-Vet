import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, accessToken } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute - User:', user, 'Loading:', loading, 'AccessToken:', !!accessToken)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !accessToken) {
    console.log('User not authenticated, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('User authenticated, allowing access')
  return <>{children}</>
}

export default ProtectedRoute
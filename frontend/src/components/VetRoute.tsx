import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface VetRouteProps {
  children: React.ReactNode;
}

const VetRoute: React.FC<VetRouteProps> = ({ children }) => {
  const { user, accessToken } = useAuth();

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'vet' || user.role === 'admin') {
    return <>{children}</>;
  }
  return <Navigate to="/" replace />;

  
};

export default VetRoute;
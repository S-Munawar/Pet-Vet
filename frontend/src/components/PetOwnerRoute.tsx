import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface PetOwnerRouteProps {
  children: React.ReactNode;
}

const PetOwnerRoute: React.FC<PetOwnerRouteProps> = ({ children }) => {
  const { user, accessToken } = useAuth();

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'pet_owner' || user.role === 'admin') {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;

  
};

export default PetOwnerRoute;
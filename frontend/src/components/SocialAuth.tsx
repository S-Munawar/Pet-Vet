import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SocialAuth: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthFromTokens } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userString = params.get("user");

    if (!accessToken || !refreshToken || !userString) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userString));
      setAuthFromTokens({ accessToken, refreshToken, user });
      navigate('/', { replace: true }); // Go home OR last page
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate, setAuthFromTokens]);

  return <p>Signing you in...</p>;
};

export default SocialAuth;

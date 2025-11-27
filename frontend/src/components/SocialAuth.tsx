import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SocialAuth: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthFromTokens } = useAuth();

  console.log('SocialAuth component mounted');
  console.log('Current URL:', window.location.href);
  console.log('URL search params:', window.location.search);
  console.log('URL pathname:', window.location.pathname);

  useEffect(() => {
    console.log('SocialAuth useEffect running');
    // Decode HTML entities in URL
    const cleanSearch = window.location.search.replace(/&amp;/g, '&');
    const params = new URLSearchParams(cleanSearch);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userString = params.get("user");

    console.log('SocialAuth - AccessToken:', !!accessToken);
    console.log('SocialAuth - RefreshToken:', !!refreshToken);
    console.log('SocialAuth - UserString:', userString);

    if (!accessToken || !refreshToken || !userString) {
      console.log('SocialAuth - Missing tokens, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userString));
      console.log('SocialAuth - Parsed user:', user);
      setAuthFromTokens({ accessToken, refreshToken, user });
      console.log('SocialAuth - Auth tokens set, navigating to home');
      
      // Use setTimeout to prevent double navigation
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('SocialAuth - Error parsing user:', error);
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default SocialAuth;

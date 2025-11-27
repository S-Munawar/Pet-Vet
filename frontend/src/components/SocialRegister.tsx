import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RegisterRequest } from '../types/interfaces';
import type { UserRole } from '../../../shared/types';

const SocialRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const provider = params.get('provider') as 'google' | 'microsoft' | null;
  const emailParam = params.get('email') || '';
  const nameParam = params.get('name') || '';
  const providerId = params.get('providerId') || '';

  const [name, setName] = useState(nameParam);
  const [email] = useState(emailParam);
  const [role, setRole] = useState<UserRole>('pet_owner');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider || !email) {
      // missing required social info — go back to register
      navigate('/register');
    }
  }, [provider, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name) throw new Error('Name is required');
      if (!role) throw new Error('Role is required');
      if (role === 'vet' && !licenseNumber) throw new Error('License number is required for veterinarians');

      // Generate a random password (user can reset/change later)
      const generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';

      const registrationData: RegisterRequest = {
        name,
        email,
        password: generatedPassword,
        role,
        authProvider: provider ? { provider, providerId } : undefined,
      };

      if (role === 'vet') registrationData.licenseNumber = licenseNumber.toUpperCase();

      await register(registrationData);

      // register() will auto-login if backend returns tokens; navigate home
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Registration</h2>
          <p className="text-gray-600">Finish your account setup to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
            >
              <option value="pet_owner">Pet Owner</option>
              <option value="vet">Veterinarian</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          {role === 'vet' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Enter your veterinary license number"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Completing Registration...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocialRegister;

import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '../types/interfaces';
import type { UserRole } from '../types/auth';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('pet_owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicStreet, setClinicStreet] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [clinicState, setClinicState] = useState('');
  const [clinicZipCode, setClinicZipCode] = useState('');
  const [clinicCountry, setClinicCountry] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const registrationData: RegisterRequest = { name, email, password, role };
      
      if (role === 'vet') {
        if (!licenseNumber) {
          setError('License number is required for veterinarians');
          setLoading(false);
          return;
        }
        registrationData.licenseNumber = licenseNumber;
        registrationData.specialization = specialization || undefined;
        registrationData.experienceYears = experienceYears ? parseInt(experienceYears) : undefined;
        registrationData.clinicName = clinicName || undefined;
        
        if (clinicStreet || clinicCity || clinicState || clinicZipCode || clinicCountry) {
          registrationData.clinicAddress = {
            street: clinicStreet || undefined,
            city: clinicCity || undefined,
            state: clinicState || undefined,
            zipCode: clinicZipCode || undefined,
            country: clinicCountry || undefined
          };
        }
      }
      
      await register(registrationData);
      setSuccess('Registration successful!');
      navigate('/');
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">
            {role === 'vet' 
              ? 'Register as a veterinarian and manage your practice' 
              : 'Join Pet-Vet to manage your pet\'s health'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
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
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Create a password"
              required
            />
          </div>

          {role === 'vet' && (
            <>
              <div className="border-t-2 border-green-200 pt-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your veterinary license number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., Small Animals, Surgery, Dentistry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., Happy Paws Clinic"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Clinic Address</h4>
                
                <input
                  type="text"
                  value={clinicStreet}
                  onChange={e => setClinicStreet(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-sm"
                  placeholder="Street Address"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={clinicCity}
                    onChange={e => setClinicCity(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-sm"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={clinicState}
                    onChange={e => setClinicState(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-sm"
                    placeholder="State/Province"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={clinicZipCode}
                    onChange={e => setClinicZipCode(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-sm"
                    placeholder="Zip/Postal Code"
                  />
                  <input
                    type="text"
                    value={clinicCountry}
                    onChange={e => setClinicCountry(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-sm"
                    placeholder="Country"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm py-4">
            <span className="px-2 bg-white text-gray-500">Or register with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { window.location.href = `${API_URL}/auth/google?flow=register`; }}
            className="flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Google
          </button>
          <button
            onClick={() => { window.location.href = `${API_URL}/auth/microsoft?flow=register`; }}
            className="flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Microsoft
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-green-600 hover:text-green-500">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

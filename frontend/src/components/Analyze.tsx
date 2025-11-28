import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Pet {
  _id: string;
  name: string;
  species: 'cat' | 'dog';
  breed: string;
  dateOfBirth: string;
}

const Analyze = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        if (!accessToken) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/pets`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pets');
        }

        const data = await response.json();
        setPets(data.pets || []);
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pets');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [accessToken]);

  const handlePetSelect = (pet: Pet) => {
    // Navigate to health analysis form with pet details
    navigate('/analyze/form', {
      state: {
        pet: {
          id: pet._id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          dateOfBirth: pet.dateOfBirth,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <p className="text-slate-600">Loading your pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto mt-8">
        <div className="card p-8 border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="container max-w-3xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <p className="text-slate-600 mb-4">No pets found. Please add a pet first.</p>
          <button
            onClick={() => navigate('/add-pet')}
            className="btn btn-primary"
          >
            Add Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto mt-8">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">Pet Health Analysis</h1>
        <p className="text-sm text-slate-600 mb-6">
          Select a pet to perform a comprehensive health analysis using our AI model.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map((pet) => (
            <button
              key={pet._id}
              onClick={() => handlePetSelect(pet)}
              className="p-4 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {pet.species === 'cat' ? '🐱' : '🐕'}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{pet.name}</h3>
                  <p className="text-sm text-slate-600">{pet.breed}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Species: {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analyze;

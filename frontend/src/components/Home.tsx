import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Home = () => {
  const { user } = useAuth()
  

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">Pet-Vet</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {user ? (
                user.role === 'pet_owner' ? 'Manage your pets, consult veterinarians, and get AI-powered health insights.' :
                user.role === 'vet' ? 'View your consulted pets and provide professional veterinary care.' :
                'Manage the Pet-Vet platform and oversee all operations.'
              ) : (
                'Your pet\'s health, simplified. Manage pets, consult veterinarians, and get AI-powered health insights all in one place.'
              )}
            </p>
            
            {user ? (
              <div className="space-y-4">
                <div className="text-center">
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* Common buttons for all users */}
                  <Link 
                    to="/select-pet" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Select Pet
                  </Link>
                  <Link 
                    to="/ai" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                  >
                    AI Pet Advisor
                  </Link>
                  
                  {/* Role-specific buttons */}
                  {user.role === 'pet_owner' && (
                    <>
                      <Link 
                        to="/add-pet" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Add Pet
                      </Link>
                      <Link 
                        to="/consult" 
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Consult Vet
                      </Link>
                    </>
                  )}
                  {user.role === 'vet' && (
                    <Link 
                      to="/consulted-pets" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Consulted Pets
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Link 
                        to="/admin" 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Admin Dashboard
                      </Link>
                      <Link 
                        to="/add-pet" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Add Pet
                      </Link>
                      <Link 
                        to="/consult" 
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Consult Vet
                      </Link>
                      <Link 
                        to="/consulted-pets" 
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Consulted Pets
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link 
                  to="/about" 
                  className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  Learn More
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section - Only show for non-authenticated users */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything Your Pet Needs</h2>
          <p className="text-lg text-gray-600">Comprehensive pet care solutions at your fingertips</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-4">🐶</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Pet Management</h3>
            <p className="text-gray-600">Add and manage your pets, track their health records, and monitor their well-being over time.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-4">👩‍⚕️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Vet Consultations</h3>
            <p className="text-gray-600">Connect with qualified veterinarians for professional advice and schedule appointments easily.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Health Advisor</h3>
            <p className="text-gray-600">Get instant AI-powered health insights and recommendations for your pet's care.</p>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}

export default Home

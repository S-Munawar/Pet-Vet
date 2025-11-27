import React from 'react';

const ConsultedPets: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Consulted Pets</h1>
          <p className="text-gray-600">View pets you have consulted and their health records.</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultedPets;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HealthStatus } from '../types/ml.types.ts';
import type { HealthPredictionResult } from '../types/ml.types.ts';

interface ResultsLocationState {
  pet: {
    id: string;
    name: string;
    species: 'cat' | 'dog';
    breed: string;
    dateOfBirth: string;
  };
  result: HealthPredictionResult;
}

const AnalysisResults = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as ResultsLocationState | null;
  const pet = state?.pet;
  const result = state?.result;

  if (!pet || !result) {
    return (
      <div className="container max-w-3xl mx-auto mt-8">
        <div className="card p-8 border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm">Analysis results not found.</p>
          <button
            onClick={() => navigate('/analyze')}
            className="mt-4 btn btn-secondary"
          >
            Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  // Determine status color and icon
  const getStatusStyle = (
    status: HealthStatus
  ): { bg: string; border: string; text: string; icon: string } => {
    switch (status) {
      case HealthStatus.Healthy:
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          icon: '✓',
        };
      case HealthStatus.AtRisk:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-700',
          icon: '⚠',
        };
      case HealthStatus.Unhealthy:
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-700',
          icon: '⚕',
        };
    }
  };

  const statusStyle = getStatusStyle(result.predicted_status);

  // Sort confidence scores for display
  const confidenceEntries = Object.entries(result.confidence_scores).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="container max-w-4xl mx-auto mt-8 mb-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/analyze')}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4"
        >
          ← Back to Pet Selection
        </button>
        <h1 className="text-3xl font-bold">
          Health Analysis Results for {pet.name}
        </h1>
      </div>

      {/* Primary Status Card */}
      <div
        className={`card mb-6 border-l-4 ${statusStyle.border} ${statusStyle.bg} p-8`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`text-4xl flex items-center justify-center w-16 h-16 rounded-full ${statusStyle.text}`}
          >
            {statusStyle.icon}
          </div>
          <div className="flex-1">
            <h2 className={`text-3xl font-bold ${statusStyle.text}`}>
              {result.predicted_status}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Analysis Timestamp: {result.prediction_timestamp}
            </p>
            <p className="text-sm text-slate-600">
              Model: {result.model_version} ({result.species.toUpperCase()})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confidence Scores */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Confidence Scores</h3>
            <div className="space-y-3">
              {confidenceEntries.map(([status, score]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      {status}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {(score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        status === 'Healthy'
                          ? 'bg-green-500'
                          : status === 'At Risk'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnosis & Treatment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnosis */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Diagnosis
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {result.diagnosis_text}
            </p>
          </div>

          {/* Treatment */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">
              Recommended Treatment
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {result.treatment_text}
            </p>
          </div>

          {/* Prescriptions */}
          {result.prescriptions.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 text-slate-900">
                Recommended Medications
              </h3>
              <ul className="space-y-2">
                {result.prescriptions.map((prescription, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-slate-700"
                  >
                    <span className="text-indigo-600 font-bold mt-0.5">
                      •
                    </span>
                    <span>{prescription}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-4 italic">
                Note: These recommendations are AI-generated. Always consult with
                a veterinarian before administering any medications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pet Information Summary */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">
          Pet Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-600">Name</p>
            <p className="text-sm font-semibold text-slate-900">{pet.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Species</p>
            <p className="text-sm font-semibold text-slate-900">
              {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Breed</p>
            <p className="text-sm font-semibold text-slate-900">{pet.breed}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Date of Birth</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(pet.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => navigate('/analyze')}
          className="btn btn-primary"
        >
          Analyze Another Pet
        </button>
        <button onClick={() => window.print()} className="btn btn-secondary">
          Print Report
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-semibold mb-2">Disclaimer</p>
        <p>
          This health analysis is provided by an artificial intelligence model
          for educational and informational purposes only. It is not a substitute
          for professional veterinary diagnosis or treatment. Always consult with
          a licensed veterinarian for proper pet health care.
        </p>
      </div>
    </div>
  );
};

export default AnalysisResults;
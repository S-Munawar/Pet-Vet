import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import { HealthAnalysisInput } from '../types/ml.types.ts';
import type { CatHealthAnalysisInput } from '../types/ml.types.ts';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  help?: string;
}

interface FormSection {
  section: string;
  fields: FormField[];
}

interface LocationState {
  pet: {
    id: string;
    name: string;
    species: 'cat' | 'dog';
    breed: string;
    dateOfBirth: string;
  };
}

const HealthAnalysisForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  const state = location.state as LocationState | null;
  const pet = state?.pet;

  const [formSections, setFormSections] = useState<FormSection[]>([]);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data with pet details
  useEffect(() => {
    if (pet && pet.dateOfBirth) {
      // Calculate age in months from dateOfBirth
      const dobString = typeof pet.dateOfBirth === 'string' 
        ? pet.dateOfBirth 
        : (pet.dateOfBirth as unknown as { toISOString?: () => string }).toISOString?.();
      
      const dob = new Date(dobString ?? '');
      const now = new Date();
      
      console.log('[HealthAnalysisForm] Pet:', pet);
      console.log('[HealthAnalysisForm] DOB String:', dobString);
      console.log('[HealthAnalysisForm] DOB Date:', dob);
      console.log('[HealthAnalysisForm] Now:', now);
      
      // Ensure valid date
      if (!isNaN(dob.getTime())) {
        const ageInMonths = Math.max(0, Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
        
        console.log('[HealthAnalysisForm] Calculated age in months:', ageInMonths);

        setFormData((prev) => ({
          ...prev,
          breed: pet.breed,
          age_in_months: ageInMonths,
        }));
      } else {
        console.error('[HealthAnalysisForm] Invalid date:', dobString);
        setFormData((prev) => ({
          ...prev,
          breed: pet.breed,
        }));
      }
    } else if (pet) {
      console.log('[HealthAnalysisForm] Pet has no dateOfBirth:', pet);
      setFormData((prev) => ({
        ...prev,
        breed: pet.breed,
      }));
    }
  }, [pet]);

  // Fetch form definitions for the species
  useEffect(() => {
    const fetchFormDefinitions = async () => {
      try {
        if (!pet) {
          setError('Pet information not found');
          setLoading(false);
          return;
        }

        if (!accessToken) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/analyzer/form-definitions?species=${pet.species}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch form definitions');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load form');
        }

        setFormSections(data.formDefinitions || []);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchFormDefinitions();
  }, [pet, accessToken]);

  // Handle input changes
  const handleInputChange = (
    fieldName: string,
    value: unknown,
    fieldType: string
  ) => {
    setFormData((prev) => {
      if (fieldType === 'checkbox') {
        return { ...prev, [fieldName]: value };
      } else if (fieldType === 'textarea' && typeof value === 'string' && value.includes(',')) {
        // Parse comma-separated values into arrays
        return {
          ...prev,
          [fieldName]: value.split(',').map((item: string) => item.trim()),
        };
      } else if (fieldName === 'vaccinations') {
        // Parse JSON vaccination data
        try {
          return {
            ...prev,
            [fieldName]: JSON.parse(typeof value === 'string' ? value : String(value)),
          };
        } catch {
          return { ...prev, [fieldName]: value };
        }
      } else {
        return { ...prev, [fieldName]: value };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!pet || !accessToken) {
        throw new Error('Missing pet or authentication information');
      }

      // Validate required fields
      const hasErrors = formSections.some((section) =>
        section.fields.some(
          (field) =>
            field.required && (formData[field.name] === undefined || formData[field.name] === '')
        )
      );

      if (hasErrors) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Calculate age in months from dateOfBirth
      const dobString = typeof pet.dateOfBirth === 'string' 
        ? pet.dateOfBirth 
        : (pet.dateOfBirth as unknown as { toISOString?: () => string }).toISOString?.();
      const dob = new Date(dobString || '');
      const now = new Date();
      const ageInMonths = Math.max(0, Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));

      // Prepare API request
      const analysisInput: CatHealthAnalysisInput = {
        breed: String(formData.breed || pet.breed),
        age_in_months: ageInMonths,
        weight_kg: parseFloat(String(formData.weight_kg || 0)),
        temperature: parseFloat(String(formData.temperature || 0)),
        heart_rate: parseInt(String(formData.heart_rate || 0)),
        respiratory_rate: parseInt(String(formData.respiratory_rate || 0)),
        blood_pressure_systolic: parseInt(String(formData.blood_pressure_systolic || 0)),
        blood_pressure_diastolic: parseInt(String(formData.blood_pressure_diastolic || 0)),
        body_condition_score: parseInt(String(formData.body_condition_score || 5)),
        hydration_status: (formData.hydration_status as 'normal' | 'mild_dehydration' | 'severe_dehydration') || 'normal',
        mucous_membrane_color: (formData.mucous_membrane_color as 'pink' | 'pale' | 'yellow') || 'pink',
        coat_condition: (formData.coat_condition as 'healthy' | 'dull' | 'matted' | 'patchy') || 'healthy',
        appetite: (formData.appetite as 'normal' | 'increased' | 'decreased' | 'absent') || 'normal',
        energy_level: (formData.energy_level as 'normal' | 'hyperactive' | 'lethargic') || 'normal',
        aggression: (formData.aggression as 'none' | 'mild' | 'moderate' | 'severe') || 'none',
        vomiting: formData.vomiting === true,
        diarrhea: formData.diarrhea === true,
        coughing: formData.coughing === true,
        limping: formData.limping === true,
        allergies: Array.isArray(formData.allergies) ? formData.allergies : [],
        chronic_conditions: Array.isArray(formData.chronic_conditions) ? formData.chronic_conditions : [],
        prescriptions: Array.isArray(formData.prescriptions) ? formData.prescriptions : [],
        vaccinations: Array.isArray(formData.vaccinations)
          ? formData.vaccinations
          : [{ vaccine_name: 'Unknown', status: 'up_to_date' }],
      };

      // Submit to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyzer/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pet_id: pet.id,
          pet_name: pet.name,
          species: pet.species,
          input_data: analysisInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error_details || 'Analysis failed');
      }

      // Navigate to results page with prediction data
      navigate('/analyze/results', {
        state: {
          pet,
          result: result.result,
        },
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze pet');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <p className="text-slate-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container max-w-3xl mx-auto mt-8">
        <div className="card p-8 border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm">Pet information not found. Please select a pet first.</p>
          <button
            onClick={() => navigate('/analyze')}
            className="mt-4 btn btn-secondary"
          >
            Back to Pet Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto mt-8 mb-8">
      <div className="card">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <button
            onClick={() => navigate('/select-pet')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4 flex items-center gap-1"
          >
            ← Back to Pet Selection
          </button>
          <div className="flex items-center gap-4">
            <div className="text-3xl">{pet.species === 'cat' ? '🐱' : '🐕'}</div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Health Analysis for {pet.name}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {pet.breed} • {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
            <p className="text-red-700 font-semibold text-sm">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hidden input to ensure age is submitted */}
        <input type="hidden" name="age_in_months" value={String(formData.age_in_months || '')} />
          {formSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-block w-1 h-6 bg-indigo-600 rounded-full"></span>
                  {section.section}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className={`${
                      field.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''
                    } flex flex-col`}
                  >
                    <label htmlFor={`field_${field.name}`} className="block text-sm font-semibold text-slate-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === 'select' && (
                      <select
                        id={`field_${field.name}`}
                        name={field.name}
                        value={String(formData[field.name] || '')}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.value, field.type)
                        }
                        disabled={field.name === 'breed'}
                        title={field.label}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-600 text-slate-900"
                        required={field.required}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'number' && (
                      <div>
                        <input
                          id={`field_${field.name}`}
                          type="number"
                          name={field.name}
                          value={String(formData[field.name] ?? '')}
                          onChange={(e) =>
                            handleInputChange(
                              field.name,
                              e.target.value,
                              field.type
                            )
                          }
                          min={field.min}
                          max={field.max}
                          step={field.step || '1'}
                          placeholder={field.placeholder}
                          title={field.label}
                          disabled={field.name === 'age_in_months'}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-600 text-slate-900"
                          required={field.required}
                        />
                        {(field.min !== undefined || field.max !== undefined) && (
                          <p className="text-xs text-slate-500 mt-1.5">
                            Range: {field.min ?? '—'} to {field.max ?? '—'}
                            {field.step && String(field.step) !== '1' ? ` (step: ${field.step})` : ''}
                          </p>
                        )}
                      </div>
                    )}

                    {field.type === 'checkbox' && (
                      <div className="flex items-center gap-3">
                        <input
                          id={`field_${field.name}`}
                          type="checkbox"
                          name={field.name}
                          checked={formData[field.name] === true}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.checked, field.type)
                          }
                          title={field.label}
                          className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <label htmlFor={`field_${field.name}`} className="text-sm text-slate-700 cursor-pointer">
                          {field.label}
                        </label>
                      </div>
                    )}

                    {field.type === 'textarea' && (
                      <div>
                        <textarea
                          id={`field_${field.name}`}
                          name={field.name}
                          value={
                            Array.isArray(formData[field.name])
                              ? (formData[field.name] as string[]).join(', ')
                              : String(formData[field.name] || '')
                          }
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value, field.type)
                          }
                          placeholder={field.placeholder}
                          title={field.label}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                          rows={3}
                        />
                        {field.help && (
                          <p className="text-xs text-slate-500 mt-1.5">{field.help}</p>
                        )}
                      </div>
                    )}

                    {field.help && field.type !== 'textarea' && (
                      <p className="text-xs text-slate-500 mt-1.5">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                '✓ Analyze Pet Health'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthAnalysisForm;
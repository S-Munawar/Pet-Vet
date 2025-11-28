import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSearchParams, useNavigate } from 'react-router-dom'

interface HealthRecord {
  _id: string
  visitDate: string
  created_by_type: string
  species_type: 'cat' | 'dog'
  commonRecordId?: string
  speciesRecordId?: string
  diagnosis?: string
  treatment?: string
}

interface PetInfo {
  name: string
  species: 'cat' | 'dog'
  breed?: string
}

const PetHistory = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const petId = searchParams.get('petId')

  const [history, setHistory] = useState<HealthRecord[]>([])
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!petId) {
          setError('Pet ID not provided')
          setLoading(false)
          return
        }

        let token = accessToken
        if (!token) {
          token = await refreshAccessToken()
          if (!token) {
            setError('Unable to obtain access token')
            setLoading(false)
            return
          }
        }

        // Fetch pet details
        const petRes = await fetch(`${import.meta.env.VITE_API_URL}/pets/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (petRes.ok) {
          const petData = await petRes.json()
          setPetInfo({
            name: petData.name,
            species: petData.species,
            breed: petData.breed,
          })
        }

        // Fetch health history for this pet
        const historyRes = await fetch(
          `${import.meta.env.VITE_API_URL}/health-records/pet/${petId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!historyRes.ok) {
          const errorData = await historyRes.json()
          throw new Error(errorData.message || 'Failed to fetch history')
        }

        const historyData = await historyRes.json()
        setHistory(Array.isArray(historyData) ? historyData : historyData.data || [])
      } catch (err: unknown) {
        let message = 'Failed to load history'
        if (typeof err === 'object' && err !== null && 'message' in err) {
          const m = (err as { message?: unknown }).message
          if (typeof m === 'string') message = m
        }
        setError(message)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [petId, accessToken, refreshAccessToken])

  if (!petId) {
    return (
      <div className="container">
        <div className="max-w-3xl mx-auto mt-8 card border-l-4 border-red-500 bg-red-50">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-2">Pet ID not provided. Please select a pet from the list.</p>
          <button
            onClick={() => navigate('/select-pet')}
            className="mt-4 btn btn-secondary text-sm"
          >
            Back to Pet Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="max-w-3xl mx-auto mt-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/select-pet')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-3 flex items-center gap-1"
          >
            ← Back to Pet Selection
          </button>

          {petInfo && (
            <div className="flex items-center gap-3">
              <div className="text-3xl">{petInfo.species === 'cat' ? '🐱' : '🐕'}</div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{petInfo.name}'s Health Records</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {petInfo.breed || 'Unknown Breed'} • {petInfo.species.charAt(0).toUpperCase() + petInfo.species.slice(1)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Card */}
        <div className="card">
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 mt-3">Loading health records...</p>
            </div>
          )}

          {error && (
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
              <p className="text-red-700 font-semibold text-sm">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-slate-600">No health records found for this pet yet.</p>
              <button
                onClick={() => navigate('/analyze')}
                className="mt-4 btn btn-primary text-sm"
              >
                Start Analysis
              </button>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                {history.length} health analysis {history.length === 1 ? 'record' : 'records'} found.
              </p>
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record._id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          Analysis on {new Date(record.visitDate).toLocaleDateString()} at{' '}
                          {new Date(record.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {record.diagnosis && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                          </p>
                        )}
                        {record.treatment && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            <span className="font-medium">Treatment:</span> {record.treatment}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span className="px-2 py-1 bg-slate-100 rounded">
                            {record.created_by_type === 'ml_model' ? '🤖 ML Analysis' : '👨‍⚕️ Vet'}
                          </span>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            {record.species_type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          alert(`View details for record ${record._id}\n\nFull details page coming soon!`)
                        }
                        className="ml-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium whitespace-nowrap"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PetHistory

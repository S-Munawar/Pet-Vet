import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

type VetProfile = {
  _id: string
  specialization?: string
  experienceYears?: number
  clinicName?: string
  clinicAddress?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  licenseNumber?: string
  issuedBy?: string
}

type Vet = {
  _id: string
  name: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  profile?: VetProfile
}

const ConsultVet = () => {
  const { accessToken, refreshAccessToken } = useAuth()
  const [vets, setVets] = useState<Vet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVets = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!accessToken) {
          const newTok = await refreshAccessToken()
          if (!newTok) {
            setError('Unable to obtain access token')
            setLoading(false)
            return
          }
        }

        const tokenToUse = accessToken || (await refreshAccessToken())

        const res = await fetch(`${import.meta.env.VITE_API_URL}/vets`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        })

        if (!res.ok) {
          let msg = await res.text()
          try {
            const j = JSON.parse(msg)
            msg = j.message || j.error || msg
          } catch (e) {
            console.error('Failed to parse error message JSON:', e)
          }
          setError(msg || `Request failed: ${res.status}`)
          setVets([])
          setLoading(false)
          return
        }

        const data = await res.json()

        const vetsArr: Vet[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : data?.vets ?? []

        setVets(vetsArr)
      } catch (e) {
        setError(String(e))
        setVets([])
      } finally {
        setLoading(false)
      }
    }

    fetchVets()
  }, [accessToken, refreshAccessToken])

  const getFullAddress = (profile?: VetProfile): string => {
    if (!profile?.clinicAddress) return 'Address not available'
    const { street, city, state, zipCode, country } = profile.clinicAddress
    return [street, city, state, zipCode, country].filter(Boolean).join(', ')
  }

  return (
    <div className="container">
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Consult a Vet</h1>
          <p className="text-slate-600">Find and connect with experienced veterinarians in your area</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading veterinarians…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {vets.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">🏥</div>
                <p className="text-slate-600 text-lg font-medium">No vets available at the moment</p>
                <p className="text-slate-500 text-sm mt-2">Please try again later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vets.map((vet) => (
                  <div key={vet._id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {vet.firstName} {vet.lastName || vet.name}
                      </h3>
                      {vet.profile?.specialization && (
                        <p className="text-blue-600 font-semibold mt-1">
                          🩺 {vet.profile.specialization}
                        </p>
                      )}
                    </div>

                    {/* Body Section */}
                    <div className="p-6 space-y-5">
                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                          Contact Information
                        </h4>

                        {vet.email && (
                          <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5 flex-shrink-0">✉️</span>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                              <a href={`mailto:${vet.email}`} className="text-blue-600 hover:underline text-sm">
                                {vet.email}
                              </a>
                            </div>
                          </div>
                        )}

                        {vet.phone && (
                          <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5 flex-shrink-0">☎️</span>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                              <a href={`tel:${vet.phone}`} className="text-slate-900 font-medium hover:text-blue-600 text-sm">
                                {vet.phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Clinic Information */}
                      {vet.profile?.clinicName && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                            Clinic Information
                          </h4>

                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Clinic Name</p>
                            <p className="text-slate-900 font-medium text-sm">{vet.profile.clinicName}</p>
                          </div>

                          {vet.profile.clinicAddress && (
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5 flex-shrink-0">📍</span>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Address</p>
                                <p className="text-slate-900 text-sm">{getFullAddress(vet.profile)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Professional Details */}
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                          Professional Details
                        </h4>

                        {vet.profile?.experienceYears !== undefined && (
                          <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5 flex-shrink-0">⭐</span>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Experience</p>
                              <p className="text-slate-900 font-medium text-sm">
                                {vet.profile.experienceYears} {vet.profile.experienceYears === 1 ? 'year' : 'years'}
                              </p>
                            </div>
                          </div>
                        )}

                        {vet.profile?.licenseNumber && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">License Number</p>
                            <p className="text-slate-900 font-mono font-medium text-sm">{vet.profile.licenseNumber}</p>
                          </div>
                        )}

                        {vet.profile?.issuedBy && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Issued By</p>
                            <p className="text-slate-900 text-sm">{vet.profile.issuedBy}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                        Schedule Consultation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ConsultVet

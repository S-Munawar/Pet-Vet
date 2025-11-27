import React from 'react'
import { useAuth } from '../hooks/useAuth'
import type { VetLicense } from '../types/interfaces'
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [licenses, setLicenses] = React.useState<VetLicense[]>([]);
  const [newLicense, setNewLicense] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();

  const fetchLicenses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/licenses`);
      const data = await response.json();
      setLicenses(data);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  const addLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicense.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseNumber: newLicense, issuedBy: user?.id })
      });
      
      if (response.ok) {
        setNewLicense('');
        fetchLicenses();
        toast.success('License added successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error adding license');
      }
    } catch (error) {
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLicenses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Add License Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Vet License</h2>
          <form onSubmit={addLicense} className="flex gap-4">
            <input
              type="text"
              value={newLicense}
              onChange={(e) => setNewLicense(e.target.value.toUpperCase())}
              placeholder="Enter license number (e.g., VET-12345)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
            >
              {loading ? 'Adding...' : 'Add License'}
            </button>
          </form>
        </div>

        {/* Licenses List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Vet Licenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {licenses.map((license) => (
                  <tr key={license.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {license.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        license.status === 'available' ? 'bg-green-100 text-green-800' :
                        license.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const issued = (license as any).issuedBy;
                        if (!issued) return '-';
                        if (typeof issued === 'string') return issued;
                        if (typeof issued === 'object') return (issued._id ?? issued.email ?? '-') as string;
                        return '-';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(license.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

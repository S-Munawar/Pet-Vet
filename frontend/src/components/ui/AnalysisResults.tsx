import React from 'react'

const ResultRow = ({ label, value, status }: { label: string; value: string; status?: 'healthy' | 'attention' | 'critical' }) => {
  const statusColor = status === 'healthy' ? 'bg-green-100 text-green-800' : status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm flex items-start justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-slate-500">{value}</div>
      </div>
      <div className={`px-2 py-1 rounded-md text-xs ${statusColor}`}>{status}</div>
    </div>
  )
}

const AnalysisResults = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analysis Results</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white rounded-md shadow-sm">Share</button>
          <button className="px-3 py-2 bg-warm-accent-500 text-white rounded-md">Download</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <h3 className="font-semibold">Summary</h3>
            <p className="text-sm text-slate-600 mt-2">High-level interpretation of the analysis with recommendations and confidence scores.</p>
          </div>

          <details className="p-4 bg-white rounded-xl shadow">
            <summary className="font-medium cursor-pointer">Detailed Metrics</summary>
            <div className="mt-3 space-y-3">
              <ResultRow label="Heart Rate" value="82 bpm" status="healthy" />
              <ResultRow label="Activity" value="Less active than normal" status="attention" />
              <ResultRow label="Weight" value="Slight increase" status="healthy" />
            </div>
          </details>
        </div>

        <aside className="space-y-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <h4 className="font-semibold">Health Score</h4>
            <div className="mt-3 text-3xl font-bold text-slate-900">78%</div>
            <div className="mt-3 text-sm text-slate-500">Color-coded indicators show where attention is required.</div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow print:hidden">
            <h4 className="font-semibold">Actions</h4>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md">Share</button>
              <button className="flex-1 px-3 py-2 bg-slate-100 rounded-md">Print</button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default AnalysisResults

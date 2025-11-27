import React from 'react'

const MetricCard = ({ title, value, color = 'vet-green' }: { title: string; value: string; color?: string }) => (
  <div className="p-4 rounded-xl bg-white shadow-lg">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </div>
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-vet-blue-400 to-vet-green-400 flex items-center justify-center text-white shadow">%{/* icon */}</div>
      </div>
    </div>
    <div className="mt-3">
      <div className="w-full bg-slate-100 h-2 rounded-md overflow-hidden">
        <div className={`h-2 rounded-md bg-${color}-500 w-3/4 transition-all`} style={{ transitionProperty: 'width' }} />
      </div>
    </div>
  </div>
)

const CircularProgress = ({ percent = 65 }: { percent?: number }) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
      <g transform="translate(48,48)">
        <circle r={radius} fill="none" stroke="#eef2ff" strokeWidth="10" />
        <circle r={radius} fill="none" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90)" />
        <text x="0" y="6" textAnchor="middle" className="text-sm font-semibold" style={{ fontSize: 14 }}>{percent}%</text>
      </g>
    </svg>
  )
}

const Dashboard = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pet Health Dashboard</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-white rounded-md shadow-sm">Export</button>
          <button className="px-3 py-2 bg-warm-accent-500 text-white rounded-md">Quick Action</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Heart Rate" value="82 bpm" />
        <MetricCard title="Activity" value="Active" />
        <div className="p-4 rounded-xl bg-white shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Overall Health</div>
            <div className="text-2xl font-semibold text-slate-900">Stable</div>
          </div>
          <CircularProgress percent={78} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 p-4 bg-white rounded-xl shadow-lg">
          <h3 className="font-semibold">Vitals Trend</h3>
          <div className="mt-4 h-48 bg-slate-50 rounded-md flex items-center justify-center text-slate-400">Chart placeholder (integrate Chart.js or Recharts)</div>
        </div>

        <aside className="p-4 bg-white rounded-xl shadow-lg">
          <h3 className="font-semibold">Status</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Skin</div>
                <div className="text-xs text-slate-500">No visible issues</div>
              </div>
              <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs">Healthy</span>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Weight</div>
                <div className="text-xs text-slate-500">Stable</div>
              </div>
              <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs">Needs attention</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default Dashboard

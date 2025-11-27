import React from 'react'

const PetProfileCard = ({ name = 'Buddy', breed = 'Mixed', age = '3 yrs' }: { name?: string; breed?: string; age?: string }) => {
  return (
    <article className="p-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative overflow-hidden rounded-lg">
        <img src="/vite.svg" alt={`${name} avatar`} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="bg-white/80 rounded-full p-1">
            <svg className="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#fff" /></svg>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">{name}</h4>
          <div className="text-sm text-slate-500">{breed} • {age}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-slate-100 rounded-md">View</button>
          <button className="px-3 py-1 bg-amber-100 text-amber-700 rounded-md">Edit</button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
        <div className="text-center">
          <div className="font-semibold">82</div>
          <div>Heart</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">3.2 km</div>
          <div>Activity</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">78%</div>
          <div>Health</div>
        </div>
      </div>
    </article>
  )
}

export default PetProfileCard

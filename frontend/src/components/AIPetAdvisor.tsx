import React from 'react'

const AIPetAdvisor = () => {
  return (
    <div className="container">
      <div className="max-w-3xl mx-auto mt-8 card">
        <h2 className="text-xl font-semibold text-slate-900">AI Pet Advisor</h2>
        <p className="text-sm text-slate-600 mt-2">Ask questions about your pet and get AI suggestions.</p>
        <div className="mt-4">
          <textarea className="w-full border rounded-md p-3 min-h-[120px]" placeholder="Describe symptoms or ask a question..."></textarea>
          <div className="mt-3 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Ask AI</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPetAdvisor

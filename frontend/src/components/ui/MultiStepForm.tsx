import React, { useState } from 'react'

const StepIndicator = ({ step, total }: { step: number; total: number }) => (
  <div className="w-full">
    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
      <span>Step {step} of {total}</span>
      <span className="font-medium">{step === total ? 'Finish' : 'Continue'}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className="h-2 bg-vet-blue-500 rounded-full transition-all" style={{ width: `${(step/total)*100}%` }} />
    </div>
  </div>
)

const MultiStepForm = () => {
  const [step, setStep] = useState(1)
  const total = 3

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto card">
        <StepIndicator step={step} total={total} />

        <form className="mt-6 space-y-4">
          {step === 1 && (
            <div>
              <label htmlFor="name" className="block text-sm">Pet Name</label>
              <input id="name" className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Enter pet name" />
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="species" className="block text-sm">Species</label>
              <input id="species" className="w-full border rounded-md px-3 py-2 mt-1" placeholder="Dog, Cat, etc." />
            </div>
          )}

          {step === 3 && (
            <div>
              <label htmlFor="notes" className="block text-sm">Notes</label>
              <textarea id="notes" className="w-full border rounded-md px-3 py-2 mt-1" rows={4} placeholder="Any relevant medical notes" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep(Math.max(1, step-1))} className="px-4 py-2 rounded-md bg-slate-100">Back</button>
            <div className="flex gap-2">
              {step < total ? (
                <button type="button" onClick={() => setStep(step+1)} className="px-4 py-2 rounded-md bg-vet-blue-500 text-white">Next</button>
              ) : (
                <button type="submit" className="px-4 py-2 rounded-md bg-warm-accent-500 text-white">Submit</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

export default MultiStepForm

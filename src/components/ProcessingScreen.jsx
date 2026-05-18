import { Icon } from './icons/Icon'
import { Card } from './ui/Card'

const processingSteps = ['Uploading audio', 'Transcribing voice', 'Extracting report fields', 'Building report']

export function ProcessingScreen({ activeIndex = 0 }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Processing</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Preparing the editable report</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          The audio has been submitted to the backend for transcription, extraction, and draft generation.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-500"
            style={{ width: `${((activeIndex + 1) / processingSteps.length) * 100}%` }}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {processingSteps.map((step, index) => {
            const complete = index < activeIndex
            const active = index === activeIndex

            return (
              <div
                className={`rounded-lg border p-4 ${
                  active
                    ? 'border-blue-200 bg-blue-50'
                    : complete
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-white'
                }`}
                key={step}
              >
                <span
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${
                    complete
                      ? 'bg-emerald-700 text-white'
                      : active
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'animate-pulse' : ''}`} name={complete ? 'check' : 'clock'} />
                </span>
                <p className="font-bold text-slate-950">{step}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {complete ? 'Complete' : active ? 'In progress' : 'Waiting'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

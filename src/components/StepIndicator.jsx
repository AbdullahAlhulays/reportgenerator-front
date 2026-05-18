import { Icon } from './icons/Icon'

export function StepIndicator({ currentStep, steps }) {
  const progressWidth = `${((currentStep + 1) / steps.length) * 100}%`
  const current = steps[currentStep]

  return (
    <nav aria-label="Report progress" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="mt-1 text-base font-bold text-slate-950">{current.label}</p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">{current.description}</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: progressWidth }} />
        </div>
      </div>

      <ol className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep

          return (
            <li
              aria-current={isCurrent ? 'step' : undefined}
              className={`rounded-lg border-l-4 p-3 ${
                isCurrent
                  ? 'border-blue-700 bg-blue-50'
                  : isComplete
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
              }`}
              key={step.label}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isComplete
                      ? 'bg-emerald-700 text-white'
                      : isCurrent
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isComplete ? <Icon className="h-4 w-4" name="check" /> : index + 1}
                </span>
                <span>
                  <span className="block whitespace-nowrap text-sm font-bold text-slate-900">{step.label}</span>
                  <span className="hidden text-xs text-slate-500 lg:block">{step.description}</span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

import { languages } from '../data/languages'
import { Icon } from './icons/Icon'

export function LanguageSelector({ error, language, onChange }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Spoken language</h3>
          <p className="mt-1 text-sm text-slate-500">Choose the language in the audio.</p>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Audio language</span>
          <span className="relative mt-2 block">
            <select
              className={`h-12 w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-base text-slate-900 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100 ${
                error ? 'border-amber-400' : 'border-slate-300'
              }`}
              onChange={(event) => onChange(event.target.value)}
              value={language}
            >
              <option value="">Choose a language</option>
              {languages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              name="chevronDown"
            />
          </span>
        </label>

        {error ? (
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" name="warning" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

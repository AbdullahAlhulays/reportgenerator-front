import { Icon } from './icons/Icon'

export function EmailOptions({ errors, receiverEmail, senderEmail, onChange }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Icon className="h-5 w-5" name="mail" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-950">Email delivery</h3>
            <p className="mt-1 text-sm text-slate-500">Optional. Leave empty to only show the report here.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Sender email</span>
            <input
              className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 ${
                errors.senderEmail ? 'border-amber-400' : 'border-slate-300'
              }`}
              inputMode="email"
              onChange={(event) => onChange('senderEmail', event.target.value)}
              placeholder="name@example.com"
              type="email"
              value={senderEmail}
            />
            {errors.senderEmail ? <span className="mt-2 block text-sm text-amber-800">{errors.senderEmail}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Receiver email</span>
            <input
              className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 ${
                errors.receiverEmail ? 'border-amber-400' : 'border-slate-300'
              }`}
              inputMode="email"
              onChange={(event) => onChange('receiverEmail', event.target.value)}
              placeholder="supervisor@example.com"
              type="email"
              value={receiverEmail}
            />
            {errors.receiverEmail ? (
              <span className="mt-2 block text-sm text-amber-800">{errors.receiverEmail}</span>
            ) : null}
          </label>
        </div>
      </div>
    </section>
  )
}

import { API_BASE_URL } from '../services/reportApi'
import { Icon } from './icons/Icon'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

const labelFor = (key) =>
  key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const getEmailStatus = (email) => {
  if (!email?.emailRequested) {
    return 'Email was not requested.'
  }

  if (email.emailSent) {
    return 'Email sent.'
  }

  return 'Report generated, but email was not sent.'
}

export function FinalReport({ fields, finalResult, onStartOver, reportId, templateName }) {
  const finalDocument = finalResult?.finalReportDocument || {}
  const email = finalResult?.email || { emailRequested: false }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Final report</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Report completed</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {finalResult?.message || 'The final report was generated successfully.'}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              <Icon className="h-4 w-4" name="check" />
              Ready
            </span>
          </div>
        </div>

        <div className="bg-slate-100 p-4 sm:p-6">
          <div className="rounded-lg border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Field operations</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">{templateName}</h3>
                </div>
                <div className="grid gap-2 text-sm text-slate-700 sm:text-right">
                  <span>
                    <span className="font-bold text-slate-950">Report ID:</span> {reportId}
                  </span>
                  <span>
                    <span className="font-bold text-slate-950">Status:</span> Final
                  </span>
                </div>
              </div>
            </div>

            <dl className="grid gap-0 divide-y divide-slate-200 p-5">
              {Object.entries(fields).map(([key, value]) => (
                <div className="grid gap-2 py-4 md:grid-cols-[220px_1fr]" key={key}>
                  <dt className="font-bold text-slate-800">{labelFor(key)}</dt>
                  <dd className="break-words leading-6 text-slate-700">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '-'}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <h3 className="text-lg font-bold text-slate-950">Downloads</h3>
          <div className="mt-4 grid gap-3">
            {finalDocument.docxUrl ? (
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                href={`${API_BASE_URL}${finalDocument.docxUrl}`}
                rel="noreferrer"
                target="_blank"
              >
                <Icon className="h-5 w-5" name="download" />
                Download DOCX
              </a>
            ) : null}
            {finalDocument.pdfUrl ? (
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                href={`${API_BASE_URL}${finalDocument.pdfUrl}`}
                rel="noreferrer"
                target="_blank"
              >
                <Icon className="h-5 w-5" name="download" />
                Download PDF
              </a>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-bold text-slate-950">Email status</h3>
          <div
            className={`mt-4 rounded-lg border p-4 text-sm font-semibold ${
              email.emailRequested && !email.emailSent
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            {getEmailStatus(email)}
          </div>
          {email.receiverEmail ? <p className="mt-3 text-sm text-slate-600">Receiver: {email.receiverEmail}</p> : null}
          {email.error ? <p className="mt-3 text-sm leading-6 text-slate-600">{email.error}</p> : null}
        </Card>

        <Button className="w-full" onClick={onStartOver} variant="primary">
          Start new report
        </Button>
      </aside>
    </div>
  )
}

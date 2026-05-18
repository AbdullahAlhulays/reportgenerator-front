import { API_BASE_URL } from '../services/reportApi'
import { Icon } from './icons/Icon'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

const getFieldValue = (value) => (value === null || value === undefined ? '' : value)

function FieldInput({ field, fieldKey, onChange, value }) {
  const inputClasses =
    'mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100'

  if (field.type === 'textarea') {
    return (
      <textarea
        className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base leading-6 text-slate-900 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        onChange={(event) => onChange(fieldKey, event.target.value)}
        required={Boolean(field.required)}
        value={getFieldValue(value)}
      />
    )
  }

  if (field.type === 'checkbox') {
    return (
      <span className="mt-2 flex min-h-12 items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4">
        <input
          checked={Boolean(value)}
          className="h-5 w-5 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
          onChange={(event) => onChange(fieldKey, event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm font-semibold text-slate-800">{value ? 'Yes' : 'No'}</span>
      </span>
    )
  }

  if (field.type === 'select') {
    return (
      <span className="relative mt-2 block">
        <select
          className={`${inputClasses} appearance-none pr-10`}
          onChange={(event) => onChange(fieldKey, event.target.value)}
          required={Boolean(field.required)}
          value={getFieldValue(value)}
        >
          <option value="">Choose an option</option>
          {(field.options || []).map((option) => (
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
    )
  }

  return (
    <input
      className={inputClasses}
      onChange={(event) => onChange(fieldKey, event.target.value)}
      required={Boolean(field.required)}
      type={field.type === 'date' ? 'date' : 'text'}
      value={getFieldValue(value)}
    />
  )
}

export function EditableReport({
  editableFields,
  editedFields,
  fieldErrors,
  isFinalizing,
  onBack,
  onChange,
  onFinalize,
  report,
  templateName,
}) {
  const draftUrl = report.draftReportDocument?.available
    ? report.draftReportDocument.docxUrl || report.draftReportDocument.url
    : ''

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Review report</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Editable fields</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review the extracted values and update anything that needs correction before finalizing.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              <Icon className="h-4 w-4" name="fileText" />
              {templateName}
            </span>
          </div>
        </div>

        <div className="bg-slate-100 p-4 sm:p-6">
          <div className="rounded-lg border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-300 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Generated draft</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">{report.templateName || templateName}</h3>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="block font-bold text-slate-950">Report ID</span>
                  {report.reportId}
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {Object.entries(editableFields).map(([key, field]) => {
                const wide = field.type === 'textarea' || String(editedFields[key] || '').length > 90

                return (
                  <label className={wide ? 'sm:col-span-2' : ''} key={key}>
                    <span className="text-sm font-bold text-slate-800">
                      {field.label || key}
                      {field.required ? <span className="text-red-700"> *</span> : null}
                    </span>
                    <FieldInput field={field} fieldKey={key} onChange={onChange} value={editedFields[key]} />
                    {fieldErrors?.[key] ? (
                      <span className="mt-2 block text-sm text-amber-800">{fieldErrors[key]}</span>
                    ) : null}
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={onBack} variant="secondary">
            <Icon className="h-5 w-5" name="arrowLeft" />
            Back
          </Button>
          <Button isLoading={isFinalizing} onClick={onFinalize} variant="success">
            <Icon className="h-5 w-5" name="send" />
            Finalize report
          </Button>
        </div>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <h3 className="text-lg font-bold text-slate-950">English transcript</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {report.englishTranscript || 'No English transcript was returned.'}
          </p>
        </Card>

        {report.missingFields?.length ? (
          <Card className="border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-2 text-amber-950">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" name="warning" />
              <div>
                <h3 className="font-bold">Missing fields</h3>
                <p className="mt-2 text-sm leading-6">
                  {report.missingFields.join(', ')}
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {draftUrl ? (
          <Card className="p-5">
            <h3 className="text-lg font-bold text-slate-950">Draft document</h3>
            <a
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              href={`${API_BASE_URL}${draftUrl}`}
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-5 w-5" name="download" />
              Download draft DOCX
            </a>
          </Card>
        ) : null}
      </aside>
    </div>
  )
}

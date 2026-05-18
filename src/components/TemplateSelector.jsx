import { useState } from 'react'
import { Icon } from './icons/Icon'
import { TemplatePreviewImage } from './TemplatePreviewImage'
import { TemplatePreviewModal } from './TemplatePreviewModal'
import { Button } from './ui/Button'

export function TemplateSelector({
  error,
  isLoading,
  loadError,
  onChange,
  onRetry,
  templateId,
  templates,
}) {
  const [previewTemplate, setPreviewTemplate] = useState(null)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Report template</h3>
            <p className="mt-1 text-sm text-slate-500">Choose one backend-managed report schema.</p>
          </div>
          {loadError ? (
            <Button onClick={onRetry} size="sm" variant="secondary">
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div className="h-56 animate-pulse rounded-xl border border-slate-200 bg-slate-100" key={item} />
            ))}
          </div>
        ) : null}

        {!isLoading && loadError ? (
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" name="warning" />
            <span>{loadError}</span>
          </div>
        ) : null}

        {!isLoading && templates.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {templates.map((template) => {
              const selected = template.templateId === templateId

              return (
                <article
                  className={`flex h-full flex-col overflow-hidden rounded-lg border bg-white transition ${
                    selected
                      ? 'border-blue-700 ring-4 ring-blue-100'
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  key={template.templateId}
                >
                  <div className="bg-slate-100 p-2 sm:p-3">
                    <TemplatePreviewImage
                      className="aspect-[4/3] w-full rounded-lg border border-slate-200 bg-white object-contain"
                      key={template.templateId}
                      placeholderClassName="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-500"
                      template={template}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-bold text-slate-950">{template.templateName}</h4>
                      {selected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                          <Icon className="h-3.5 w-3.5" name="check" />
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{template.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button className="w-full" onClick={() => setPreviewTemplate(template)} size="sm" variant="secondary">
                        <Icon className="h-4 w-4" name="fileText" />
                        Preview
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => onChange(template.templateId)}
                        size="sm"
                        variant={selected ? 'success' : 'primary'}
                      >
                        {selected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}

        {error ? (
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" name="warning" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      <TemplatePreviewModal
        isSelected={previewTemplate?.templateId === templateId}
        onClose={() => setPreviewTemplate(null)}
        onSelect={onChange}
        template={previewTemplate}
      />
    </section>
  )
}

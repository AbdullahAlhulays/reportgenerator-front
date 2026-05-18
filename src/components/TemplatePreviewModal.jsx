import { TemplatePreviewImage } from './TemplatePreviewImage'
import { Button } from './ui/Button'

export function TemplatePreviewModal({ isSelected, onClose, onSelect, template }) {
  if (!template) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 px-4 py-4 sm:items-center"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Template preview</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">{template.templateName}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{template.description}</p>
          </div>
          <button
            aria-label="Close preview"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            onClick={onClose}
            type="button"
          >
            <span className="block h-5 w-5 text-center text-xl leading-4">x</span>
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-100 p-3">
            <TemplatePreviewImage
              className="max-h-[70vh] w-full rounded-lg border border-slate-200 bg-white object-contain"
              key={template.templateId}
              placeholderClassName="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500"
              template={template}
            />
          </div>

          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Backend template ID</p>
              <p className="mt-2 break-all text-sm leading-6 text-slate-600">{template.templateId}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
            </div>

            <div>
              <p className="text-sm leading-6 text-slate-600">
                Fields are provided by the backend after processing, so this frontend only sends the selected template ID.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="w-full"
                onClick={() => {
                  onSelect(template.templateId)
                  onClose()
                }}
                variant={isSelected ? 'success' : 'primary'}
              >
                {isSelected ? 'Selected' : 'Select template'}
              </Button>
              <Button className="w-full" onClick={onClose} variant="secondary">
                Close preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

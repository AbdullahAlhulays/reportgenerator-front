import { useCallback, useEffect, useMemo, useState } from 'react'
import { AudioInput } from './components/AudioInput'
import { EditableReport } from './components/EditableReport'
import { EmailOptions } from './components/EmailOptions'
import { FinalReport } from './components/FinalReport'
import { Header } from './components/Header'
import { Icon } from './components/icons/Icon'
import { LanguageSelector } from './components/LanguageSelector'
import { ProcessingScreen } from './components/ProcessingScreen'
import { StepIndicator } from './components/StepIndicator'
import { TemplateSelector } from './components/TemplateSelector'
import { Button } from './components/ui/Button'
import { defaultTemplates } from './data/defaultTemplates'
import { getTemplates, finalizeReport, submitReportRequest } from './services/reportApi'
import { validateAudioDuration, validateReportRequest } from './utils/validation'

const initialForm = {
  audioFile: null,
  audioPreviewUrl: '',
  audioSource: '',
  language: '',
  templateId: '',
  senderEmail: '',
  receiverEmail: '',
}

const workflowSteps = [
  { label: 'Prepare', description: 'Audio and template' },
  { label: 'Processing', description: 'Backend extraction' },
  { label: 'Review', description: 'Edit fields' },
  { label: 'Final', description: 'Downloads' },
]

const intakeSteps = [
  {
    label: 'Audio',
    title: 'Add audio',
    description: 'Record now or upload a supported audio file.',
  },
  {
    label: 'Setup',
    title: 'Choose report setup',
    description: 'Select the spoken language and backend report template.',
  },
  {
    label: 'Send',
    title: 'Submit request',
    description: 'Email delivery is optional.',
  },
]

const screenToStep = {
  input: 0,
  processing: 1,
  review: 2,
  final: 3,
}

const buildEditedFields = (editableFields = {}) =>
  Object.fromEntries(Object.entries(editableFields).map(([key, field]) => [key, field.value]))

const normalizeTemplates = (templateResponse) => (Array.isArray(templateResponse) ? templateResponse : [])

function App() {
  const [editableFields, setEditableFields] = useState({})
  const [editedFields, setEditedFields] = useState({})
  const [errors, setErrors] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [finalResult, setFinalResult] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [intakeStep, setIntakeStep] = useState(0)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [processingIndex, setProcessingIndex] = useState(0)
  const [report, setReport] = useState(null)
  const [requestError, setRequestError] = useState('')
  const [screen, setScreen] = useState('input')
  const [templateLoadError, setTemplateLoadError] = useState('')
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.templateId === form.templateId),
    [form.templateId, templates],
  )

  const selectedTemplateName = report?.templateName || selectedTemplate?.templateName || 'Field Report'

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setTemplateLoadError('')

    try {
      const templateResponse = await getTemplates()
      setTemplates(normalizeTemplates(templateResponse))
    } catch (error) {
      setTemplates(defaultTemplates)
      setTemplateLoadError(
        `${error.message || 'Could not load templates from the backend.'} Showing local template previews.`,
      )
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    getTemplates()
      .then((templateResponse) => {
        if (isActive) {
          setTemplates(normalizeTemplates(templateResponse))
        }
      })
      .catch((error) => {
        if (isActive) {
          setTemplates(defaultTemplates)
          setTemplateLoadError(
            `${error.message || 'Could not load templates from the backend.'} Showing local template previews.`,
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setTemplatesLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (screen !== 'processing') {
      return undefined
    }

    const interval = window.setInterval(() => {
      setProcessingIndex((index) => Math.min(index + 1, 3))
    }, 650)

    return () => window.clearInterval(interval)
  }, [screen])

  useEffect(
    () => () => {
      if (form.audioPreviewUrl) {
        window.URL.revokeObjectURL(form.audioPreviewUrl)
      }
    },
    [form.audioPreviewUrl],
  )

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
    setRequestError('')
  }

  const handleAudioChange = (file, previewUrl, source) => {
    setForm((current) => {
      if (current.audioPreviewUrl) {
        window.URL.revokeObjectURL(current.audioPreviewUrl)
      }

      return {
        ...current,
        audioFile: file,
        audioPreviewUrl: previewUrl,
        audioSource: source,
      }
    })
    setErrors((current) => ({ ...current, audioFile: '' }))
    setRequestError('')
  }

  const validateBeforeSubmit = async () => {
    const nextErrors = validateReportRequest(form)

    if (!nextErrors.audioFile && form.audioFile) {
      try {
        const durationError = await validateAudioDuration(form.audioFile)

        if (durationError) {
          nextErrors.audioFile = durationError
        }
      } catch (durationError) {
        nextErrors.audioFile = durationError.message
      }
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event?.preventDefault()
    setRequestError('')

    const nextErrors = await validateBeforeSubmit()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const requestData = new FormData()
    requestData.append('audioFile', form.audioFile)
    requestData.append('language', form.language)
    requestData.append('templateId', form.templateId)

    if (form.senderEmail.trim()) {
      requestData.append('senderEmail', form.senderEmail.trim())
    }

    if (form.receiverEmail.trim()) {
      requestData.append('receiverEmail', form.receiverEmail.trim())
    }

    setProcessingIndex(0)
    setScreen('processing')
    setFinalResult(null)
    setFieldErrors({})

    try {
      const response = await submitReportRequest(requestData)
      const responseFields = response.editableFields || {}

      setReport(response)
      setEditableFields(responseFields)
      setEditedFields(buildEditedFields(responseFields))
      setScreen('review')
    } catch (error) {
      setRequestError(error.message || 'The report could not be processed.')
      setScreen('input')
    }
  }

  const handleFieldChange = (key, value) => {
    setEditedFields((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: '' }))
  }

  const validateEditedFields = () => {
    const nextFieldErrors = {}

    Object.entries(editableFields).forEach(([key, field]) => {
      const value = editedFields[key]
      const empty = value === null || value === undefined || value === ''

      if (field.required && empty) {
        nextFieldErrors[key] = `${field.label || key} is required.`
      }
    })

    setFieldErrors(nextFieldErrors)
    return Object.keys(nextFieldErrors).length === 0
  }

  const handleFinalize = async () => {
    if (!report || !validateEditedFields()) {
      return
    }

    setIsFinalizing(true)
    setRequestError('')

    try {
      const result = await finalizeReport({
        editedFields,
        receiverEmail: form.receiverEmail.trim(),
        reportId: report.reportId,
        senderEmail: form.senderEmail.trim(),
        templateId: report.templateId || form.templateId,
      })

      setFinalResult(result)
      setScreen('final')
    } catch (error) {
      setRequestError(error.message || 'The report could not be finalized.')
    } finally {
      setIsFinalizing(false)
    }
  }

  const startOver = () => {
    if (form.audioPreviewUrl) {
      window.URL.revokeObjectURL(form.audioPreviewUrl)
    }

    setEditableFields({})
    setEditedFields({})
    setErrors({})
    setFieldErrors({})
    setFinalResult(null)
    setForm(initialForm)
    setIntakeStep(0)
    setIsFinalizing(false)
    setProcessingIndex(0)
    setReport(null)
    setRequestError('')
    setScreen('input')
  }

  const goToNextIntakeStep = async () => {
    const nextErrors = await validateBeforeSubmit()

    if (intakeStep === 0 && nextErrors.audioFile) {
      setErrors({ audioFile: nextErrors.audioFile })
      return
    }

    if (intakeStep === 1 && (nextErrors.language || nextErrors.templateId)) {
      setErrors({
        language: nextErrors.language,
        templateId: nextErrors.templateId,
      })
      return
    }

    setErrors({})
    setRequestError('')
    setIntakeStep((step) => Math.min(step + 1, intakeSteps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousIntakeStep = () => {
    setErrors({})
    setRequestError('')
    setIntakeStep((step) => Math.max(step - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {screen !== 'input' ? <StepIndicator currentStep={screenToStep[screen]} steps={workflowSteps} /> : null}

        {requestError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
            <p className="font-bold">Request failed</p>
            <p className="mt-1 leading-6">{requestError}</p>
          </div>
        ) : null}

        {screen === 'input' ? (
          <form className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" onSubmit={handleSubmit}>
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-700">
                    Step {intakeStep + 1} of {intakeSteps.length}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">{intakeSteps[intakeStep].title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{intakeSteps[intakeStep].description}</p>
                </div>

                <ol className="grid grid-cols-3 gap-2 sm:w-80">
                  {intakeSteps.map((step, index) => {
                    const active = index === intakeStep
                    const complete = index < intakeStep

                    return (
                      <li
                        className={`rounded-lg border px-3 py-2 text-center text-sm font-bold ${
                          active
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : complete
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-500'
                        }`}
                        key={step.label}
                      >
                        {step.label}
                      </li>
                    )
                  })}
                </ol>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-700 transition-all"
                  style={{ width: `${((intakeStep + 1) / intakeSteps.length) * 100}%` }}
                />
              </div>
            </div>

            <section className="p-4 sm:p-6">
              {intakeStep === 0 ? (
                <AudioInput
                  audioFile={form.audioFile}
                  audioPreviewUrl={form.audioPreviewUrl}
                  audioSource={form.audioSource}
                  error={errors.audioFile}
                  onAudioChange={handleAudioChange}
                />
              ) : null}

              {intakeStep === 1 ? (
                <div className="grid gap-5">
                  <LanguageSelector
                    error={errors.language}
                    language={form.language}
                    onChange={(value) => updateForm('language', value)}
                  />
                  <TemplateSelector
                    error={errors.templateId}
                    isLoading={templatesLoading}
                    loadError={templateLoadError}
                    onChange={(value) => updateForm('templateId', value)}
                    onRetry={loadTemplates}
                    templateId={form.templateId}
                    templates={templates}
                  />
                </div>
              ) : null}

              {intakeStep === 2 ? (
                <div className="grid gap-5">
                  <EmailOptions
                    errors={errors}
                    onChange={updateForm}
                    receiverEmail={form.receiverEmail}
                    senderEmail={form.senderEmail}
                  />
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-bold text-slate-950">Summary</h3>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">Audio</dt>
                        <dd className="truncate font-bold text-slate-950">{form.audioFile?.name || 'Missing'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Language</dt>
                        <dd className="font-bold text-slate-950">{form.language || 'Missing'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Template</dt>
                        <dd className="font-bold text-slate-950">{selectedTemplate?.templateName || 'Missing'}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Email</dt>
                        <dd className="truncate font-bold text-slate-950">{form.receiverEmail || 'Not used'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ) : null}

              {Object.values(errors).some(Boolean) ? (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <div className="flex gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" name="warning" />
                    <p className="font-bold">Complete the required item.</p>
                  </div>
                </div>
              ) : null}
            </section>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <Button disabled={intakeStep === 0} onClick={goToPreviousIntakeStep} variant="secondary">
                <Icon className="h-5 w-5" name="arrowLeft" />
                Back
              </Button>

              {intakeStep < intakeSteps.length - 1 ? (
                <Button onClick={goToNextIntakeStep} size="lg">
                  Continue
                </Button>
              ) : (
                <Button size="lg" type="submit">
                  <Icon className="h-5 w-5" name="send" />
                  Submit for report
                </Button>
              )}
            </div>
          </form>
        ) : null}

        {screen === 'processing' ? <ProcessingScreen activeIndex={processingIndex} /> : null}

        {screen === 'review' && report ? (
          <EditableReport
            editableFields={editableFields}
            editedFields={editedFields}
            fieldErrors={fieldErrors}
            isFinalizing={isFinalizing}
            onBack={() => setScreen('input')}
            onChange={handleFieldChange}
            onFinalize={handleFinalize}
            report={report}
            templateName={selectedTemplateName}
          />
        ) : null}

        {screen === 'final' && report ? (
          <FinalReport
            fields={editedFields}
            finalResult={finalResult}
            onStartOver={startOver}
            reportId={report.reportId}
            templateName={selectedTemplateName}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App

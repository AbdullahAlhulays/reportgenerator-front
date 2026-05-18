import { useMemo, useState } from 'react'
import { API_BASE_URL } from '../services/reportApi'

const templateIdPattern = /^[a-z0-9_-]+$/

const resolveBackendAssetUrl = (path) => {
  if (!path) {
    return ''
  }

  if (path.startsWith('template-previews/')) {
    return path
  }

  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`
}

const getLocalPreviewUrl = (templateId) => {
  if (!templateIdPattern.test(templateId || '')) {
    return ''
  }

  return `template-previews/${templateId}.svg`
}

export function TemplatePreviewImage({ className, placeholderClassName = '', template }) {
  const sources = useMemo(
    () => [getLocalPreviewUrl(template?.templateId), resolveBackendAssetUrl(template?.previewImagePath)].filter(Boolean),
    [template?.previewImagePath, template?.templateId],
  )
  const [sourceIndex, setSourceIndex] = useState(0)

  const activeSource = sources[sourceIndex]

  if (!activeSource) {
    return (
      <div className={placeholderClassName}>
        Preview image unavailable
      </div>
    )
  }

  return (
    <img
      alt={`${template.templateName} preview`}
      className={className}
      onError={() => {
        setSourceIndex((index) => index + 1)
      }}
      src={activeSource}
    />
  )
}

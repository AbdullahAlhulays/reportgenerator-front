export const API_BASE_URL = 'https://voice-report-backend-production.up.railway.app'

class ApiRequestError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.details = details
  }
}

const getMethod = (options = {}) => options.method || 'GET'

const readErrorMessage = (payload, fallback) => {
  if (!payload) {
    return fallback
  }

  if (payload.error || payload.message) {
    return payload.error || payload.message
  }

  if (typeof payload.detail === 'string') {
    return payload.detail
  }

  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item.msg || item.message || item.type)
      .filter(Boolean)
      .join(' ')
  }

  return fallback
}

async function parseResponse(response, endpoint, method) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok || payload?.success === false) {
    throw new ApiRequestError(
      readErrorMessage(payload, `${method} ${endpoint} failed with status ${response.status}.`),
      {
        endpoint,
        method,
        payload,
        status: response.status,
      },
    )
  }

  return payload
}

async function apiRequest(endpoint, options = {}) {
  const method = getMethod(options)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
    return parseResponse(response, endpoint, method)
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error
    }

    throw new ApiRequestError(
      `Could not reach ${method} ${endpoint} at ${API_BASE_URL}. Check that the backend is still running, CORS allows this browser origin, and the backend did not close the connection while processing the audio. Browser error: ${error.message}`,
      {
        endpoint,
        method,
        network: true,
      },
    )
  }
}

export async function getTemplates() {
  return apiRequest('/api/templates')
}

export async function submitReportRequest(formData) {
  return apiRequest('/api/process-report', {
    method: 'POST',
    body: formData,
  })
}

export async function finalizeReport({ editedFields, receiverEmail, reportId, senderEmail, templateId }) {
  const body = {
    reportId,
    templateId,
    editedFields,
  }

  if (senderEmail) {
    body.senderEmail = senderEmail
  }

  if (receiverEmail) {
    body.receiverEmail = receiverEmail
  }

  return apiRequest('/api/finalize-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function getReport(reportId) {
  return apiRequest(`/api/reports/${reportId}`)
}

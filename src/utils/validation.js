const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ACCEPTED_AUDIO_EXTENSIONS = ['.webm', '.wav', '.mp3', '.m4a', '.ogg']
export const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024
export const MAX_AUDIO_DURATION_SECONDS = 300

export function isValidEmail(value) {
  return emailPattern.test(value.trim())
}

export function getAudioExtension(fileName = '') {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

export function validateAudioFile(file) {
  if (!file) {
    return 'Add a recording or upload an audio file before continuing.'
  }

  if (file.size === 0) {
    return 'The selected audio file is empty. Record again or upload another file.'
  }

  const extension = getAudioExtension(file.name)

  if (!ACCEPTED_AUDIO_EXTENSIONS.includes(extension)) {
    return 'Use a WEBM, WAV, MP3, M4A, or OGG audio file.'
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return 'Audio must be 25 MB or smaller.'
  }

  return ''
}

export function readAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    const objectUrl = window.URL.createObjectURL(file)

    const cleanup = () => {
      audio.removeAttribute('src')
      window.URL.revokeObjectURL(objectUrl)
    }

    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      const { duration } = audio
      cleanup()
      resolve(Number.isFinite(duration) ? duration : 0)
    }
    audio.onerror = () => {
      cleanup()
      reject(new Error('Audio duration could not be read. Choose another audio file.'))
    }
    audio.src = objectUrl
  })
}

export async function validateAudioDuration(file) {
  const duration = await readAudioDuration(file)

  if (duration > MAX_AUDIO_DURATION_SECONDS) {
    return 'Audio must be 5 minutes or shorter.'
  }

  return ''
}

export function validateReportRequest(form) {
  const errors = {}
  const audioError = validateAudioFile(form.audioFile)

  if (audioError) {
    errors.audioFile = audioError
  }

  if (!form.language) {
    errors.language = 'Select the spoken language in the audio.'
  }

  if (!form.templateId) {
    errors.templateId = 'Select one report template.'
  }

  if (form.senderEmail && !isValidEmail(form.senderEmail)) {
    errors.senderEmail = 'Enter a valid sender email address.'
  }

  if (form.receiverEmail && !isValidEmail(form.receiverEmail)) {
    errors.receiverEmail = 'Enter a valid receiver email address.'
  }

  return errors
}

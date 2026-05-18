import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ACCEPTED_AUDIO_EXTENSIONS,
  MAX_AUDIO_DURATION_SECONDS,
  validateAudioDuration,
  validateAudioFile,
} from '../utils/validation'
import { Icon } from './icons/Icon'
import { Button } from './ui/Button'

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function AudioInput({ audioFile, audioPreviewUrl, audioSource, error, onAudioChange }) {
  const chunksRef = useRef([])
  const mediaRecorderRef = useRef(null)
  const recordingStartTimeRef = useRef(0)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingError, setRecordingError] = useState('')

  const stopStream = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => stopStream, [stopStream])

  const startRecording = async () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      return
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError('Recording is not supported in this browser. Upload an audio file instead.')
      return
    }

    try {
      setRecordingError('')
      chunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      streamRef.current = stream
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        const file = new File([blob], `field-recording-${Date.now()}.webm`, {
          type: blob.type || 'audio/webm',
        })

        const validationError = validateAudioFile(file)
        if (validationError) {
          setRecordingError(validationError)
          stopStream()
          setIsRecording(false)
          return
        }

        onAudioChange(file, window.URL.createObjectURL(blob), 'recording')
        stopStream()
        setIsRecording(false)
      }

      recorder.start()
      recordingStartTimeRef.current = Date.now()
      setElapsedSeconds(0)
      setIsRecording(true)
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      timerRef.current = window.setInterval(() => {
        const nextSeconds = Math.min(
          Math.floor((Date.now() - recordingStartTimeRef.current) / 1000),
          MAX_AUDIO_DURATION_SECONDS,
        )

        setElapsedSeconds(nextSeconds)

        if (nextSeconds >= MAX_AUDIO_DURATION_SECONDS && recorder.state === 'recording') {
          recorder.stop()
        }
      }, 1000)
    } catch {
      stopStream()
      setIsRecording(false)
      setRecordingError('Microphone access was not allowed. Upload an audio file or allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const validationError = validateAudioFile(file)
    if (validationError) {
      setRecordingError(validationError)
      event.target.value = ''
      return
    }

    try {
      const durationError = await validateAudioDuration(file)

      if (durationError) {
        setRecordingError(durationError)
        event.target.value = ''
        return
      }

      setRecordingError('')
      onAudioChange(file, window.URL.createObjectURL(file), 'upload')
    } catch (durationError) {
      setRecordingError(durationError.message)
      event.target.value = ''
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Choose audio source</h3>
          <p className="mt-1 text-sm text-slate-500">Record now or upload an audio file.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">Browser recording</p>
                <p className="text-sm text-slate-500">
                  {isRecording
                    ? `Recording ${formatTime(elapsedSeconds)} of ${formatTime(MAX_AUDIO_DURATION_SECONDS)}`
                    : 'Use the microphone on this device.'}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isRecording ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="h-5 w-5" name={isRecording ? 'square' : 'mic'} />
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button className="w-full" disabled={isRecording} onClick={startRecording} variant="primary">
                Start recording
              </Button>
              <Button className="w-full" disabled={!isRecording} onClick={stopRecording} variant={isRecording ? 'danger' : 'secondary'}>
                Stop recording
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" name="upload" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">Upload audio file</p>
                <p className="text-sm text-slate-500">WEBM, WAV, MP3, M4A, and OGG up to 25 MB.</p>
              </div>
            </div>
            <label className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-700 sm:w-auto">
              Choose file
              <input
                accept={`${ACCEPTED_AUDIO_EXTENSIONS.join(',')},audio/*`}
                className="sr-only"
                onChange={handleUpload}
                type="file"
              />
            </label>
          </div>
        </div>

        {audioFile ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-blue-900">
                  {audioSource === 'recording' ? 'Recorded audio ready' : 'Uploaded audio ready'}
                </p>
                <p className="mt-1 break-all text-sm text-blue-800">{audioFile.name}</p>
              </div>
              {audioPreviewUrl ? <audio className="w-full max-w-md" controls src={audioPreviewUrl} /> : null}
            </div>
          </div>
        ) : null}

        {error || recordingError ? (
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" name="warning" />
            <span>{error || recordingError}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

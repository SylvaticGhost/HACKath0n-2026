import { Result } from '@/types/result'

const SERVER_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_SERVER_URL ?? import.meta.env.SERVER_URL ?? 'http://localhost:3000/api')

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function executeRequest(path: string, options?: RequestInit): Promise<Response> {
  const headers = new Headers(options?.headers)
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(SERVER_URL + path, { ...options, headers })

  if (res.status >= 500) throw new ApiError('Unexpected server error', res.status)

  return res
}

export async function fetchApiBlob(path: string, options?: RequestInit): Promise<Blob> {
  const res = await executeRequest(path, options)
  if (!res.ok) throw new ApiError('Request failed', res.status)
  return await res.blob()
}

export async function fetchApiResult<T>(path: string, options?: RequestInit): Promise<Result<T>> {
  const res = await executeRequest(path, options)

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new ApiError('Unexpected response format', res.status)
  }

  const data = await res.json()

  if (typeof data !== 'object' || data === null || typeof (data as Record<string, unknown>).statusCode !== 'number') {
    throw new ApiError('Invalid Result object: missing or invalid statusCode')
  }

  return Result.parseObject<T>(data)
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const result = await fetchApiResult<T>(path, options)

  if (result.isFailure()) {
    throw new ApiError(result.errorMessage || 'Unknown error', result.statusCode)
  }

  return result.strictValue
}

import { Result } from '@/types/result'
import Cookies from 'js-cookie'
import type { UserLoggedDto } from 'shared'
import { useAuthStore } from '@/shared/auth/auth.store'

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

function getSession(): UserLoggedDto | null {
  const sessionString = Cookies.get('session')
  if (!sessionString) return null
  try {
    return JSON.parse(sessionString) as UserLoggedDto
  } catch {
    return null
  }
}

function handleUnauthorized(): never {
  useAuthStore.getState().markUnauthorized()
  throw new ApiError('Not authorized', 401)
}

async function executeRequest(path: string, options?: RequestInit, requiresToken: boolean = true): Promise<Response> {
  const session = getSession()
  // Pre-flight token check
  if (requiresToken && !session?.jwt) handleUnauthorized()

  const headers = new Headers(options?.headers)
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData

  // set headers
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (requiresToken && session?.jwt) {
    headers.set('Authorization', `Bearer ${session.jwt}`)
  }

  const res = await fetch(SERVER_URL + path, { ...options, headers })

  // err handling
  if (res.status === 401) handleUnauthorized()
  if (res.status >= 500) throw new ApiError('Unexpected server error', res.status)

  return res
}

export async function fetchApiBlob(path: string, options?: RequestInit, requiresToken: boolean = true): Promise<Blob> {
  const res = await executeRequest(path, options, requiresToken)
  if (!res.ok) throw new ApiError('Request failed', res.status)
  return await res.blob()
}

export async function fetchApiResult<T>(
  path: string,
  options?: RequestInit,
  requiresToken: boolean = true,
): Promise<Result<T>> {
  const res = await executeRequest(path, options, requiresToken)

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new ApiError('Unexpected response format', res.status)
  }

  const data = await res.json()

  if (typeof data !== 'object' || data === null || typeof (data as Record<string, unknown>).statusCode !== 'number') {
    throw new ApiError('Invalid Result object: missing or invalid statusCode')
  }

  const result = Result.parseObject<T>(data)

  // business error handling
  if (result.isFailure() && result.statusCode === 401) handleUnauthorized()

  return result
}

export async function fetchApi<T>(path: string, options?: RequestInit, requiresToken: boolean = true): Promise<T> {
  const result = await fetchApiResult<T>(path, options, requiresToken)

  if (result.isFailure()) {
    throw new ApiError(result.errorMessage || 'Unknown error', result.statusCode)
  }

  return result.strictValue
}

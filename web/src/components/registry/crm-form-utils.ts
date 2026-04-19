import { format, isValid, parseISO } from 'date-fns'

function tryParseDate(value: unknown) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsedFromIso = parseISO(value)
    if (isValid(parsedFromIso)) {
      return parsedFromIso
    }
  }

  const parsedFromDate = new Date(String(value))
  return isValid(parsedFromDate) ? parsedFromDate : null
}

export function toDateInputValue(value: unknown) {
  const parsedDate = tryParseDate(value)
  return parsedDate ? format(parsedDate, 'yyyy-MM-dd') : ''
}

export function parseRequiredNumber(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue ? Number(trimmedValue) : Number.NaN
}

export function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue ? Number(trimmedValue) : null
}

export function parseOptionalText(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

export function getRequestErrorMessage(error: unknown, fallback = 'Unexpected request error') {
  return error instanceof Error ? error.message : fallback
}

export function getValidationErrorMessage(
  error: { issues?: Array<{ path?: Array<string | number>; message?: string }> },
  fallback = 'Please check the form fields',
) {
  const firstIssue = error.issues?.[0]
  if (!firstIssue) {
    return fallback
  }

  const path = firstIssue.path ?? []
  const pathPrefix = path.length > 0 ? `${path.join('.')}: ` : ''
  return `${pathPrefix}${firstIssue.message ?? fallback}`
}

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export interface ValidationMetadata {
  validationStatus?: 'VALID' | 'INVALID' | null
  validationErrors?: string[] | null
  crmValidationStatus?: 'VALID' | 'INVALID' | null
  crmValidationErrors?: string[] | null
  validation_status?: 'VALID' | 'INVALID' | null
  validation_errors?: string[] | null
  crm_validation_status?: 'VALID' | 'INVALID' | null
  crm_validation_errors?: string[] | null
}

const ERROR_LABELS: Record<string, string> = {
  MISSING_CADASTRAL: 'Missing cadastral number',
  INVALID_CADASTRAL_FORMAT: 'Invalid cadastral number format',
  MISSING_OWNER: 'Missing owner',
  MISSING_RIGHT_TYPE: 'Missing right type',
  MISSING_DATE: 'Missing registration date',
  MISSING_DOCUMENT: 'Missing document number',
}

interface ValidationStatusIndicatorProps {
  value: ValidationMetadata & Record<string, unknown>
}

function hasMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  return false
}

function collectMissingRequiredFields(value: ValidationMetadata): string[] {
  const row = value as Record<string, unknown>

  if ('cadastralNumber' in row) {
    const required: Array<[string, string]> = [
      ['cadastralNumber', 'Cadastral Number'],
      ['koatuu', 'KOATUU'],
      ['ownershipType', 'Ownership'],
      ['intendedPurpose', 'Intended Purpose'],
      ['location', 'Location'],
      ['landPurposeType', 'Land Purpose'],
      ['square', 'Area'],
      ['estimateValue', 'Estimate Value'],
      ['stateTaxId', 'Tax ID'],
      ['user', 'User'],
      ['stateRegistrationDate', 'Registration Date'],
      ['ownershipRegistrationId', 'Registration Id'],
      ['registrator', 'Registrator'],
      ['type', 'Type'],
    ]

    return required.filter(([key]) => hasMissingValue(row[key])).map(([, label]) => `Missing: ${label}`)
  }

  const required: Array<[string, string]> = [
    ['stateTaxId', 'Tax ID'],
    ['ownershipRegistrationDate', 'Registration Date'],
    ['taxpayerName', 'Taxpayer'],
    ['objectType', 'Object Type'],
    ['objectAddress', 'Address'],
    ['totalArea', 'Total Area'],
  ]

  return required.filter(([key]) => hasMissingValue(row[key])).map(([, label]) => `Missing: ${label}`)
}

export function ValidationStatusIndicator({ value }: ValidationStatusIndicatorProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const status =
    value.validationStatus ??
    value.crmValidationStatus ??
    value.validation_status ??
    value.crm_validation_status ??
    null

  const errors =
    value.validationErrors ?? value.crmValidationErrors ?? value.validation_errors ?? value.crm_validation_errors ?? []

  const inferredErrors = collectMissingRequiredFields(value)
  const finalErrors = errors.length > 0 ? errors : inferredErrors

  const isInvalid = status === 'INVALID' || finalErrors.length > 0

  if (!isInvalid) {
    return (
      <div className="flex w-5 items-center justify-center" title="Valid data">
        <CheckCircle2 className="size-4 text-emerald-500" />
      </div>
    )
  }

  if (isInvalid) {
    return (
      <div
        ref={containerRef}
        className="relative flex w-5 items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="inline-flex cursor-pointer items-center justify-center rounded-md p-1 hover:bg-destructive/10 transition-colors">
          <AlertCircle className="size-4 text-destructive" />
        </button>
        {open && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 bg-popover text-popover-foreground rounded-md border shadow-md p-3 w-64 animate-in fade-in-0 zoom-in-95">
            <p className="font-semibold text-sm text-destructive flex items-center gap-2 mb-2">
              <AlertCircle className="size-3.5" />
              Validation issues:
            </p>
            {finalErrors.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {finalErrors.map((errorCode) => (
                  <li key={errorCode} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{ERROR_LABELS[errorCode] ?? errorCode}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Data is marked invalid by backend validation.</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return null
}

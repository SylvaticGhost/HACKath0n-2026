import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
  value: ValidationMetadata
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
      <div className="flex w-5 items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help items-center justify-center">
              <AlertCircle className="size-4 text-destructive" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-72">
            <p className="mb-1 font-semibold text-destructive">Validation issues:</p>
            {finalErrors.length > 0 ? (
              <ul className="space-y-0.5 text-xs">
                {finalErrors.map((errorCode) => (
                  <li key={errorCode}>• {ERROR_LABELS[errorCode] ?? errorCode}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs">Data is marked invalid by backend validation.</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return null
}

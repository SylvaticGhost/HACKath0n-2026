import { LandRegistry } from '../registry/entities/land.registry.entity'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ValidationStatus = 'VALID' | 'INVALID'

export type ValidationError =
  | 'MISSING_CADASTRAL'
  | 'INVALID_CADASTRAL_FORMAT'
  | 'MISSING_OWNER'
  | 'MISSING_RIGHT_TYPE'
  | 'MISSING_DATE'
  | 'MISSING_DOCUMENT'

export interface ProcessedLandRecord extends Partial<LandRegistry> {
  validationStatus: ValidationStatus
  validationErrors: ValidationError[]
}

// ─── Mapping dictionaries ─────────────────────────────────────────────────────

const RIGHT_TYPE_MAP: Record<string, string> = {
  власність: 'Власність',
  'право власності': 'Власність',
  оренда: 'Оренда',
}

// Keys are lowercased for case-insensitive lookup
const RIGHT_SUBTYPE_MAP: Record<string, string> = {
  заповіт: 'за заповітом',
}

// ─── Helper normalizers ───────────────────────────────────────────────────────

const EMPTY_VALUES = new Set(['', '-', 'n/a', 'н/д', 'null', 'none'])

function normalizeString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const s = String(value)
    .trim()
    .replace(/\s*[^а-яА-ЯіїєёІЇЄЁa-zA-Z0-9\s.,()'/:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (EMPTY_VALUES.has(s.toLowerCase())) return null
  return s || null
}

function normalizeCadastralNumber(value: unknown): string | null {
  const s = normalizeString(value)
  if (!s) return null
  // Keep only digits and colons, remove spaces
  const cleaned = s.replace(/[^0-9:]/g, '')
  return cleaned || null
}

// Standard Ukrainian cadastral format: XXXXXXXXXX:XX:XXX:XXXX
const CADASTRAL_RE = /^\d{10}:\d{2}:\d{3}:\d{4}$/

function isValidCadastralFormat(value: string): boolean {
  return CADASTRAL_RE.test(value)
}

function normalizeOwnerName(value: unknown): string | null {
  const s = normalizeString(value)
  if (!s) return null
  // Title Case — safe for Cyrillic because toUpperCase/toLowerCase work on it
  return s.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function normalizeRightType(value: unknown): string | null {
  const s = normalizeString(value)
  if (!s) return null
  const mapped = RIGHT_TYPE_MAP[s.toLowerCase()]
  // Anything not in the map → USAGE per spec
  return mapped ?? 'Користування'
}

function normalizeRightSubtype(value: unknown): string | null {
  const s = normalizeString(value)
  if (!s) return null
  const mapped = RIGHT_SUBTYPE_MAP[s.toLowerCase()]
  return mapped ?? s
}

function normalizeDate(value: unknown): Date | null {
  if (value === undefined || value === null) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value

  const s = String(value).trim()
  if (EMPTY_VALUES.has(s.toLowerCase())) return null

  // DD.MM.YYYY
  const dot = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (dot) {
    const d = new Date(`${dot[3]}-${dot[2]}-${dot[1]}`)
    return isNaN(d.getTime()) ? null : d
  }

  // DD/MM/YYYY
  const slash = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slash) {
    const d = new Date(`${slash[3]}-${slash[2]}-${slash[1]}`)
    return isNaN(d.getTime()) ? null : d
  }

  // YYYY-MM-DD or ISO datetime
  const iso = s.match(/^\d{4}-\d{2}-\d{2}/)
  if (iso) {
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }

  // Last resort
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// ─── Core functions ───────────────────────────────────────────────────────────

export function normalizeRecord(record: Partial<LandRegistry>): Partial<LandRegistry> {
  const cadastralNumber = normalizeCadastralNumber(record.cadastralNumber) ?? undefined
  const user = normalizeOwnerName(record.user) ?? undefined
  const ownershipType = normalizeString(record.ownershipType) ?? undefined
  const type = normalizeRightType(record.type) ?? undefined
  const subtype = normalizeRightSubtype(record.subtype) ?? undefined
  const stateRegistrationDate = normalizeDate(record.stateRegistrationDate as unknown) ?? undefined
  const ownershipRegistrationId = normalizeString(record.ownershipRegistrationId) ?? undefined
  const location = normalizeString(record.location) ?? undefined
  const registrator = normalizeString(record.registrator) ?? undefined
  const intendedPurpose = normalizeString(record.intendedPurpose) ?? undefined
  const landPurposeType = normalizeString(record.landPurposeType) ?? undefined
  const koatuu = normalizeString(record.koatuu) ?? undefined
  const stateTaxId = normalizeString(record.stateTaxId) ?? undefined

  return {
    ...record,
    cadastralNumber,
    user,
    ownershipType,
    type,
    subtype,
    stateRegistrationDate,
    ownershipRegistrationId,
    location,
    registrator,
    intendedPurpose,
    landPurposeType,
    koatuu,
    stateTaxId,
  }
}

export function validateRecord(record: Partial<LandRegistry>): {
  status: ValidationStatus
  errors: ValidationError[]
} {
  const errors: ValidationError[] = []

  // CRITICAL fields
  if (!record.cadastralNumber) {
    errors.push('MISSING_CADASTRAL')
  } else if (!isValidCadastralFormat(record.cadastralNumber)) {
    errors.push('INVALID_CADASTRAL_FORMAT')
  }

  if (!record.type) {
    errors.push('MISSING_RIGHT_TYPE')
  }

  // CONDITIONAL fields (required for a fully valid record)
  if (!record.user) errors.push('MISSING_OWNER')
  if (!record.stateRegistrationDate) errors.push('MISSING_DATE')
  if (!record.ownershipRegistrationId) errors.push('MISSING_DOCUMENT')

  return { status: errors.length === 0 ? 'VALID' : 'INVALID', errors }
}

export function processRecords(records: Partial<LandRegistry>[]): ProcessedLandRecord[] {
  const processed: ProcessedLandRecord[] = []
  // Dedup key: (cadastralNumber, user, type, registrationDate)
  const seen = new Set<string>()

  for (const raw of records) {
    const normalized = normalizeRecord(raw)
    const { status, errors } = validateRecord(normalized)

    const dedupKey = [
      normalized.cadastralNumber ?? '',
      normalized.user ?? '',
      normalized.type ?? '',
      normalized.stateRegistrationDate instanceof Date
        ? normalized.stateRegistrationDate.toISOString().slice(0, 10)
        : String(normalized.stateRegistrationDate ?? ''),
    ].join('\x00')

    if (!normalized.ownershipRegistrationId) continue

    if (seen.has(dedupKey)) continue
    seen.add(dedupKey)

    processed.push({ ...normalized, validationStatus: status, validationErrors: errors })
  }

  return processed
}

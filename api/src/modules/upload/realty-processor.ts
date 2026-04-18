import { RealtyRegistry } from '../registry/entities/realty.registry.entity'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValidationStatus = 'VALID' | 'INVALID'

export type RealtyValidationError =
  | 'MISSING_TAX_ID'
  | 'MISSING_TAXPAYER_NAME'
  | 'MISSING_OBJECT_TYPE'
  | 'MISSING_ADDRESS'
  | 'MISSING_REGISTRATION_DATE'
  | 'MISSING_AREA'

export interface ParsedAddress {
  region?: string
  district?: string
  city?: string
  street?: string
  buildingNumber?: string
  apartmentNumber?: string
  addressFull: string
}

export interface ProcessedRealtyRecord extends Partial<RealtyRegistry> {
  validationStatus: ValidationStatus
  validationErrors: RealtyValidationError[]
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ObjectTypeEnum = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER'
export type MaterialEnum = 'BRICK' | 'PANEL' | 'CONCRETE' | 'OTHER'

// ─── NULL sentinel values ──────────────────────────────────────────────────────

const NULL_VALUES = new Set(['', '-', 'n/a', 'невідомо', 'відсутній', 'null', 'none', '—', 'н/д'])

function isNullValue(s: string): boolean {
  return NULL_VALUES.has(s.toLowerCase().trim())
}

// ─── String helpers ───────────────────────────────────────────────────────────

function normalizeString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const s = String(value).trim().replace(/\s+/g, ' ')
  return isNullValue(s) ? null : s || null
}

// ─── 1. object_type ───────────────────────────────────────────────────────────

const OBJECT_TYPE_MAP: Record<string, ObjectTypeEnum> = {
  квартира: 'APARTMENT',
  'житлова квартира': 'APARTMENT',
  будинок: 'HOUSE',
  'житловий будинок': 'HOUSE',
  'нежитлове приміщення': 'COMMERCIAL',
  'комерційне приміщення': 'COMMERCIAL',
  'земельна ділянка': 'LAND',
}

export function normalizeObjectType(value: unknown): ObjectTypeEnum | null {
  const s = normalizeString(value)
  if (!s) return null
  return OBJECT_TYPE_MAP[s.toLowerCase()] ?? 'OTHER'
}

// ─── 2. object_name ───────────────────────────────────────────────────────────

export function normalizeObjectName(value: unknown): string | null {
  const s = normalizeString(value)
  if (!s) return null
  // Remove consecutive duplicate words (case-insensitive check, preserve original)
  return s
    .split(/\s+/)
    .filter((word, i, arr) => i === 0 || word.toLowerCase() !== arr[i - 1].toLowerCase())
    .join(' ')
}

// ─── 3. address ───────────────────────────────────────────────────────────────

const ABBR_MAP: [RegExp, string][] = [
  [/\bвул\./gi, 'вулиця'],
  [/\bпросп\./gi, 'проспект'],
  [/\bпров\./gi, 'провулок'],
  [/\bбульв\./gi, 'бульвар'],
  [/\bпл\./gi, 'площа'],
  [/\bпр-т\./gi, 'проспект'],
  [/\bвул\b/gi, 'вулиця'],
]

function expandAbbreviations(s: string): string {
  let result = s
  for (const [pattern, replacement] of ABBR_MAP) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function cleanAddressString(s: string): string {
  return expandAbbreviations(s)
    .replace(/,{2,}/g, ',') // duplicate commas
    .replace(/\s*,\s*/g, ', ') // normalize comma spacing
    .replace(/\s+/g, ' ')
    .trim()
}

// Best-effort structural parse of Ukrainian address
export function parseAddress(value: unknown): ParsedAddress | null {
  const s = normalizeString(value)
  if (!s) return null

  const cleaned = cleanAddressString(s)
  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  const result: ParsedAddress = { addressFull: cleaned }

  // Heuristic patterns
  const regionPattern = /область|обл\./i
  const districtPattern = /район|р-н/i
  const cityPattern = /^(м\.|місто|с\.|село|смт\.|селище)/i
  const streetPattern = /(вулиця|проспект|провулок|бульвар|площа|шосе|набережна)/i
  const buildingPattern = /^(\d+[а-яА-ЯA-Za-z]?)$/
  const apartmentPattern = /^кв\.?\s*(\d+)$/i

  for (const part of parts) {
    if (!result.region && regionPattern.test(part)) {
      result.region = part
    } else if (!result.district && districtPattern.test(part)) {
      result.district = part
    } else if (!result.city && cityPattern.test(part)) {
      result.city = part
    } else if (!result.street && streetPattern.test(part)) {
      result.street = part
    } else if (!result.buildingNumber && buildingPattern.test(part)) {
      result.buildingNumber = part
    } else if (!result.apartmentNumber) {
      const aptMatch = part.match(apartmentPattern)
      if (aptMatch) result.apartmentNumber = aptMatch[1]
    }
  }

  return result
}

// ─── 4. area ─────────────────────────────────────────────────────────────────

export function normalizeArea(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return isNaN(value) ? null : value

  const s = String(value)
    .trim()
    .replace(/кв\.?\s*м\.?/gi, '')
    .replace(/м\s*2/gi, '')
    .replace(/га/gi, '')
    .replace(/,/g, '.')
    .trim()

  if (isNullValue(s) || !s) return null
  const num = parseFloat(s)
  return isNaN(num) ? null : num
}

// ─── 5. ownership_share ───────────────────────────────────────────────────────

export function normalizeOwnershipShare(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') {
    // Already a decimal (e.g. 0.5) or a percentage stored as number (e.g. 50)
    if (value > 1 && value <= 100) return value / 100
    return value >= 0 && value <= 1 ? value : null
  }

  const s = String(value).trim()
  if (isNullValue(s)) return null

  // Fraction: "1/2", "3/4"
  const fractionMatch = s.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10)
    const den = parseInt(fractionMatch[2], 10)
    if (den === 0) return null
    const result = num / den
    return result >= 0 && result <= 1 ? result : null
  }

  // Percentage: "75%", "100 %"
  const percentMatch = s.match(/^([\d.,]+)\s*%$/)
  if (percentMatch) {
    const num = parseFloat(percentMatch[1].replace(',', '.'))
    return isNaN(num) ? null : Math.min(1, num / 100)
  }

  // Plain decimal
  const num = parseFloat(s.replace(',', '.'))
  if (isNaN(num)) return null
  if (num > 1 && num <= 100) return num / 100
  return num >= 0 && num <= 1 ? num : null
}

// ─── 6. registration_number ──────────────────────────────────────────────────

export function normalizeRegistrationNumber(value: unknown): string | null {
  const s = normalizeString(value)
  if (!s) return null
  return s.replace(/[^a-zA-Zа-яА-ЯіїєёІЇЄЁ0-9]/g, '').toUpperCase() || null
}

// ─── 7. object_id ────────────────────────────────────────────────────────────

export function normalizeObjectId(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const s = String(value).trim().replace(/\s+/g, '')
  return isNullValue(s) || !s ? null : s
}

// ─── 8. floor ────────────────────────────────────────────────────────────────

export function normalizeFloor(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return Number.isInteger(value) ? value : Math.trunc(value)

  const s = String(value)
    .trim()
    .replace(/поверх|пов\.|эт\.|этаж/gi, '')
    .trim()

  // Range "2-4" → take first
  const rangeMatch = s.match(/^(\d+)\s*[-–]\s*\d+$/)
  if (rangeMatch) return parseInt(rangeMatch[1], 10)

  const num = parseInt(s, 10)
  return isNaN(num) ? null : num
}

// ─── 9. total_floors ─────────────────────────────────────────────────────────

export function normalizeTotalFloors(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return Number.isInteger(value) ? value : null

  const s = String(value).replace(/[^\d]/g, '').trim()
  const num = parseInt(s, 10)
  return isNaN(num) ? null : num
}

// ─── 10. construction_year ───────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()

export function normalizeConstructionYear(value: unknown): number | null {
  if (value === undefined || value === null) return null

  const s = String(value)
  const match = s.match(/\b(1[89]\d{2}|20\d{2})\b/)
  if (!match) return null

  const year = parseInt(match[1], 10)
  return year >= 1800 && year <= CURRENT_YEAR ? year : null
}

// ─── 11. material ────────────────────────────────────────────────────────────

const MATERIAL_MAP: Record<string, MaterialEnum> = {
  цегла: 'BRICK',
  цегляний: 'BRICK',
  цегляна: 'BRICK',
  панель: 'PANEL',
  панельний: 'PANEL',
  панельна: 'PANEL',
  бетон: 'CONCRETE',
  монолітний: 'CONCRETE',
  монолітна: 'CONCRETE',
  моноліт: 'CONCRETE',
}

export function normalizeMaterial(value: unknown): MaterialEnum | null {
  const s = normalizeString(value)
  if (!s) return null
  return MATERIAL_MAP[s.toLowerCase()] ?? 'OTHER'
}

// ─── Core: normalizeRealtyRecord ─────────────────────────────────────────────

export function normalizeRealtyRecord(record: Partial<RealtyRegistry>): Partial<RealtyRegistry> {
  const taxpayerName = normalizeObjectName(record.taxpayerName) ?? undefined
  const objectType = normalizeObjectType(record.objectType) ?? undefined
  const totalArea = normalizeArea(record.totalArea) ?? undefined
  const ownershipShare = normalizeOwnershipShare(record.ownershipShare) ?? undefined
  const jointOwnershipType = normalizeString(record.jointOwnershipType) ?? undefined
  const stateTaxId = normalizeString(record.stateTaxId) ?? undefined

  // Address: clean and store back in objectAddress
  const addr = parseAddress(record.objectAddress)
  const objectAddress = addr?.addressFull ?? normalizeString(record.objectAddress) ?? undefined

  // Dates
  const ownershipRegistrationDate =
    record.ownershipRegistrationDate instanceof Date
      ? isNaN(record.ownershipRegistrationDate.getTime())
        ? undefined
        : record.ownershipRegistrationDate
      : undefined
  const ownershipTerminationDate =
    record.ownershipTerminationDate instanceof Date
      ? isNaN(record.ownershipTerminationDate.getTime())
        ? undefined
        : record.ownershipTerminationDate
      : undefined

  return {
    ...record,
    stateTaxId,
    taxpayerName,
    objectType,
    objectAddress,
    totalArea,
    ownershipShare,
    jointOwnershipType,
    ownershipRegistrationDate,
    ownershipTerminationDate,
  }
}

// ─── Core: validateRealtyRecord ───────────────────────────────────────────────

export function validateRealtyRecord(record: Partial<RealtyRegistry>): {
  status: ValidationStatus
  errors: RealtyValidationError[]
} {
  const errors: RealtyValidationError[] = []

  if (!record.stateTaxId) errors.push('MISSING_TAX_ID')
  if (!record.taxpayerName) errors.push('MISSING_TAXPAYER_NAME')
  if (!record.objectType) errors.push('MISSING_OBJECT_TYPE')
  if (!record.objectAddress) errors.push('MISSING_ADDRESS')
  if (!record.ownershipRegistrationDate) errors.push('MISSING_REGISTRATION_DATE')
  if (record.totalArea == null) errors.push('MISSING_AREA')

  return { status: errors.length === 0 ? 'VALID' : 'INVALID', errors }
}

// ─── Core: processRealtyRecords ───────────────────────────────────────────────

export function processRealtyRecords(records: Partial<RealtyRegistry>[]): ProcessedRealtyRecord[] {
  const processed: ProcessedRealtyRecord[] = []
  const seen = new Set<string>()

  for (const raw of records) {
    const normalized = normalizeRealtyRecord(raw)
    const { status, errors } = validateRealtyRecord(normalized)

    const dedupKey = [
      normalized.stateTaxId ?? '',
      normalized.taxpayerName ?? '',
      normalized.objectType ?? '',
      normalized.ownershipRegistrationDate instanceof Date
        ? normalized.ownershipRegistrationDate.toISOString().slice(0, 10)
        : String(normalized.ownershipRegistrationDate ?? ''),
    ].join('\x00')

    if (seen.has(dedupKey)) continue
    seen.add(dedupKey)

    processed.push({ ...normalized, validationStatus: status, validationErrors: errors })
  }

  return processed
}

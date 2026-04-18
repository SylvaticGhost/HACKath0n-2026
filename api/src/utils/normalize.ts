/**
 * Ukrainian text normalization utilities for diff comparison.
 *
 * Problem: the same real-world value appears in many forms across data sources:
 *   - Latin lookalike chars: "гаражi" (Latin i) vs "гаражі" (Cyrillic і) — affects ~17% of objectType values
 *   - Abbreviations:  "вул." vs "вулиця", "обл." vs "область", "с." vs "село"
 *   - Trailing garbage: "Острівська сільська рада, -"  or "...рада."
 *   - Extra whitespace: "с.Острів" vs "с. Острів"
 *
 * All functions return a normalized string suitable for COMPARISON ONLY.
 * Original values are preserved in the database and shown to the user.
 */

/** Map of Latin lookalike characters → Cyrillic equivalents (lowercase only, applied after toLowerCase). */
const LATIN_TO_CYR: [RegExp, string][] = [
  [/i/g, 'і'], // Latin i (U+0069) → Cyrillic і (U+0456) — most frequent issue in the data
  [/a/g, 'а'], // Latin a → Cyrillic а
  [/e/g, 'е'], // Latin e → Cyrillic е
  [/o/g, 'о'], // Latin o → Cyrillic о
  [/p/g, 'р'], // Latin p → Cyrillic р
  [/c/g, 'с'], // Latin c → Cyrillic с
  [/x/g, 'х'], // Latin x → Cyrillic х
  [/y/g, 'у'], // Latin y → Cyrillic у
]

/**
 * General-purpose text normalization.
 * Applies: lowercase → collapse spaces → fix Latin lookalike chars.
 *
 * Use for: ownershipType, objectType, user, taxpayerName, landPurposeType.
 */
export function normalizeText(s: string | null | undefined): string {
  if (!s) return ''
  let result = s.toLowerCase().trim()
  for (const [pattern, replacement] of LATIN_TO_CYR) {
    result = result.replace(pattern, replacement)
  }
  return result.replace(/\s+/g, ' ').trim()
}

/**
 * Abbreviated Ukrainian admin terms → full form.
 * Applied after normalizeText (so input is already lowercase).
 *
 * Order matters: longer/specific patterns first to avoid partial replacements.
 */
const UA_ABBR_EXPANSIONS: [RegExp, string][] = [
  // с/рада → сільська рада  (before plain "с." rule)
  [/с\/рада\.?\s*/g, 'сільська рада '],
  // вул. → вулиця
  [/вул\.\s*/g, 'вулиця '],
  // буд. → будинок
  [/буд\.\s*/g, 'будинок '],
  // кв. → квартира
  [/кв\.\s*/g, 'квартира '],
  // обл. → область
  [/обл\.\s*/g, 'область '],
  // р-н → район
  [/р-н\.?\s*/g, 'район '],
  // пров. → провулок
  [/пров\.\s*/g, 'провулок '],
  // пр-т → проспект
  [/пр-т\.?\s*/g, 'проспект '],
  // м. followed by space → місто  (е.g. "м. Червоноград" but not "м²")
  [/\bм\.\s+(?=\S)/g, 'місто '],
  // р. followed by space → район (е.g. "р. Сокальський")
  [/\bр\.\s+(?=\S)/g, 'район '],
  // с. followed by space and a word → село  (е.g. "с. Острів", "с.Острів")
  [/\bс\.\s*(?=[а-яіїєa-z])/g, 'село '],
]

/**
 * Location / address normalization.
 * Extends normalizeText with:
 *  - abbreviation expansion (вул. → вулиця, etc.)
 *  - trailing garbage removal (", -", trailing punctuation)
 *
 * Use for: land.location, realty.objectAddress.
 */
export function normalizeLocation(s: string | null | undefined): string {
  if (!s) return ''
  let result = normalizeText(s)

  // Expand Ukrainian administrative abbreviations
  for (const [pattern, replacement] of UA_ABBR_EXPANSIONS) {
    result = result.replace(pattern, replacement)
  }

  // Remove trailing ", -" / ", -, -" patterns (garbage from some data exports)
  result = result.replace(/(,\s*-\s*)+$/, '')

  // Remove trailing punctuation and spaces
  result = result.replace(/[,.\s]+$/, '')

  // Final whitespace collapse
  return result.replace(/\s+/g, ' ').trim()
}

/**
 * Intended purpose normalization for land records.
 * Strips the leading numeric code (e.g. "01.01 ") that is sometimes omitted.
 * "01.01 Для ведення товарного..." ≡ "Для ведення товарного..."
 */
export function normalizeIntendedPurpose(s: string | null | undefined): string {
  if (!s) return ''
  // Strip code prefix like "01.01 " or "13.02 "
  const stripped = s.replace(/^\d{2}\.\d{2}\s+/, '')
  return normalizeText(stripped)
}

/**
 * Normalize a numeric field value coming from a raw file cell.
 * Converts comma-decimal ("49,3") → dot-decimal ("49.3") and parses to float.
 * Returns undefined for non-numeric or empty input.
 */
export function normalizeNumeric(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const str = String(value).trim().replace(',', '.')
  const num = parseFloat(str)
  return isNaN(num) ? undefined : num
}

/**
 * Convert an Excel serial date number to a JS Date.
 * Excel epoch: Dec 30 1899 = serial 0, with a deliberate off-by-one bug for 1900.
 * For serials >= 61 (i.e. post Feb 28 1900):  date = epoch + serial days.
 *
 * Plausible range for registry data: ~36500 (2000-01-01) – ~73000 (2099-12-31).
 */
export function excelSerialToDate(serial: number): Date {
  // Standard formula: subtract 25569 days (Excel→Unix epoch offset) and convert to ms
  return new Date(Math.round((serial - 25569) * 86400 * 1000))
}

/**
 * Returns true if the value looks like an Excel serial date
 * (integer in the plausible 1980–2100 range: serials 29220–73050).
 */
export function isExcelSerial(value: unknown): value is number {
  if (typeof value !== 'number') return false
  return Number.isInteger(value) && value >= 29220 && value <= 73050
}

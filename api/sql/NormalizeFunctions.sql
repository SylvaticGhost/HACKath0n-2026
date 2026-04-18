-- =============================================================================
-- Ukrainian text normalization functions for diff comparison.
--
-- Mirror of api/src/utils/normalize.ts — keeps TypeScript and SQL logic in sync.
--
-- Run this file BEFORE Views.sql, since the views depend on these functions.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- normalize_ua_text(text) → text
--
-- General-purpose normalization:
--   1. Lowercase
--   2. Fix Latin lookalike characters → Cyrillic
--      Most critical: Latin 'i' (U+0069) → Cyrillic 'і' (U+0456)
--      Affects ~17% of realty objectType values in the source data.
--   3. Collapse multiple whitespace to single space + trim
--
-- Use for: ownership_type, object_type, "user", taxpayer_name, land_purpose_type
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION normalize_ua_text(s TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  IF s IS NULL OR s = '' THEN RETURN s; END IF;

  result := lower(s);

  -- Fix Latin lookalike chars → Cyrillic (applied after lowercase so only one case to handle)
  result := replace(result, 'i', 'і');  -- Latin i (0x69) → Cyrillic і (U+0456) — most frequent issue
  result := replace(result, 'a', 'а');  -- Latin a → Cyrillic а
  result := replace(result, 'e', 'е');  -- Latin e → Cyrillic е
  result := replace(result, 'o', 'о');  -- Latin o → Cyrillic о
  result := replace(result, 'p', 'р');  -- Latin p → Cyrillic р
  result := replace(result, 'c', 'с');  -- Latin c → Cyrillic с
  result := replace(result, 'x', 'х');  -- Latin x → Cyrillic х
  result := replace(result, 'y', 'у');  -- Latin y → Cyrillic у

  -- Collapse multiple whitespace → single space, trim
  result := trim(regexp_replace(result, '\s+', ' ', 'g'));

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- -----------------------------------------------------------------------------
-- normalize_ua_location(text) → text
--
-- Full location / address normalization.
-- Extends normalize_ua_text with:
--   - Ukrainian administrative abbreviation expansion
--   - Trailing garbage removal (", -" patterns from data exports)
--   - Trailing punctuation removal
--
-- Equivalences handled:
--   "вул. Франка" ≡ "вулиця Франка"
--   "обл." ≡ "область"
--   "с. Острів" ≡ "с.Острів" ≡ "село Острів"
--   "Острівська сільська рада, -" ≡ "Острівська сільська рада"
--   "Острівська сільська рада." ≡ "Острівська сільська рада"
--   "Острiвська" (Latin i) ≡ "Острівська" (Cyrillic і)
--
-- Use for: land.location, realty.object_address
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION normalize_ua_location(s TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  IF s IS NULL OR s = '' THEN RETURN s; END IF;

  -- Step 1: basic text normalization (lowercase + Latin→Cyrillic + collapse spaces)
  result := normalize_ua_text(s);

  -- Step 2: expand Ukrainian administrative abbreviations
  -- Order matters: specific/longer patterns first

  -- с/рада → сільська рада  (must be before plain "с." rule)
  result := regexp_replace(result, 'с/рада\.?\s*', 'сільська рада ', 'g');

  -- вул. → вулиця
  result := regexp_replace(result, 'вул\.\s*', 'вулиця ', 'g');

  -- буд. → будинок
  result := regexp_replace(result, 'буд\.\s*', 'будинок ', 'g');

  -- кв. → квартира
  result := regexp_replace(result, 'кв\.\s*', 'квартира ', 'g');

  -- обл. → область
  result := regexp_replace(result, 'обл\.\s*', 'область ', 'g');

  -- р-н → район
  result := regexp_replace(result, 'р-н\.?\s*', 'район ', 'g');

  -- пров. → провулок
  result := regexp_replace(result, 'пров\.\s*', 'провулок ', 'g');

  -- пр-т → проспект
  result := regexp_replace(result, 'пр-т\.?\s*', 'проспект ', 'g');

  -- м. followed by a non-space → місто  (e.g. "м. Червоноград", "м.Соснівка")
  result := regexp_replace(result, 'м\.\s+', 'місто ', 'g');

  -- р. followed by space → район  (e.g. "р. Сокальський")
  result := regexp_replace(result, '\mр\.\s+', 'район ', 'g');

  -- с. followed by optional space and a Cyrillic letter → село  (e.g. "с. Острів", "с.Острів")
  -- Using a lookahead isn't directly available but we use \m (word start boundary in PG regex)
  result := regexp_replace(result, '\mс\.\s*([а-яіїє])', 'село \1', 'g');

  -- Step 3: remove trailing garbage patterns: ", -" / ", -, -" etc.
  result := regexp_replace(result, '(,\s*-\s*)+$', '', 'g');

  -- Step 4: remove trailing punctuation
  result := regexp_replace(result, '[,\.\s]+$', '', 'g');

  -- Step 5: final whitespace collapse + trim
  result := trim(regexp_replace(result, '\s+', ' ', 'g'));

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- -----------------------------------------------------------------------------
-- normalize_ua_purpose(text) → text
--
-- Intended-purpose field normalization for land records.
-- Strips the leading numeric code that is sometimes included and sometimes not:
--   "01.01 Для ведення товарного..." ≡ "Для ведення товарного..."
--   "13.02 Для розміщення..." ≡ "Для розміщення..."
--
-- Use for: land.intended_purpose
-- (Note: intended_purpose is NOT currently in the diff view CONFLICT check,
--  but this function is available if the view is extended.)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION normalize_ua_purpose(s TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  IF s IS NULL OR s = '' THEN RETURN s; END IF;

  -- Strip leading code like "01.01 " or "13.02 "
  result := regexp_replace(s, '^\d{2}\.\d{2}\s+', '', 'g');

  -- Apply general text normalization
  result := normalize_ua_text(result);

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

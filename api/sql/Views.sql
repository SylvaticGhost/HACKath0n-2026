-- =============================================================================
-- Diff views: compare registry (reference/authoritative) vs crm (local copy).
--
-- Normalization functions from NormalizeFunctions.sql are used in CONFLICT
-- conditions so that cosmetic formatting differences are not flagged as real
-- discrepancies.
--
-- Equivalences handled automatically:
--   Numeric:  "49,3" ≡ "49.3"  (handled at parse time by upload service)
--   Text:     "гаражi" ≡ "гаражі"  (Latin i vs Cyrillic і)
--   Address:  "вул. Франка" ≡ "вулиця Франка"
--             "с.Острів" ≡ "с. Острів" ≡ "село Острів"
--             "Острівська сільська рада, -" ≡ "Острівська сільська рада"
--             "обл." ≡ "область", "р-н" ≡ "район"
--
-- IMPORTANT: Run NormalizeFunctions.sql before this file.
-- =============================================================================


-- =============================================================================
-- v_land_diff
--
-- Compares registry.land (etalon) vs crm.land (locally uploaded data).
-- Join key: cadastral_number (varchar, e.g. "4624884200:15:000:0684")
--
-- Fields compared (with normalization where applicable):
--   state_tax_id       — exact match (numeric code stored as string)
--   "user"             — normalize_ua_text  (fixes Latin chars, collapses spaces)
--   square             — numeric exact match
--   estimate_value     — numeric exact match
--   ownership_type     — normalize_ua_text  (e.g. "Приватна" vs "приватна")
--   location           — normalize_ua_location  (abbreviations, trailing garbage)
--   owner_part         — numeric exact match
-- =============================================================================
CREATE OR REPLACE VIEW v_land_diff AS
SELECT
    COALESCE(r.cadastral_number, c.cadastral_number) AS cadastral_number,

    CASE
        WHEN c.cadastral_number IS NULL THEN 'NEW_IN_REGISTRY'
        WHEN r.cadastral_number IS NULL THEN 'MISSING_IN_REGISTRY'
        WHEN r.state_tax_id IS DISTINCT FROM c.state_tax_id
          OR normalize_ua_text(r."user")        IS DISTINCT FROM normalize_ua_text(c."user")
          OR r.square                            IS DISTINCT FROM c.square
          OR r.estimate_value                    IS DISTINCT FROM c.estimate_value
          OR normalize_ua_text(r.ownership_type) IS DISTINCT FROM normalize_ua_text(c.ownership_type)
          OR normalize_ua_location(r.location)   IS DISTINCT FROM normalize_ua_location(c.location)
          OR r.owner_part                        IS DISTINCT FROM c.owner_part
        THEN 'CONFLICT'
        ELSE 'MATCH'
    END AS diff_status,

    -- Дані Реєстру (Еталон) — зберігаємо оригінальні значення для відображення
    r.state_tax_id      AS registry_tax_id,
    r."user"            AS registry_user,
    r.square            AS registry_square,
    r.estimate_value    AS registry_estimate_value,
    r.location          AS registry_location,

    -- Дані локальної CRM — зберігаємо оригінальні значення для відображення
    c.state_tax_id      AS crm_tax_id,
    c."user"            AS crm_user,
    c.square            AS crm_square,
    c.estimate_value    AS crm_estimate_value,
    c.location          AS crm_location

FROM registry.land r
FULL OUTER JOIN crm.land c
    ON r.cadastral_number = c.cadastral_number;


-- =============================================================================
-- v_realty_diff
--
-- Compares registry.realty (etalon) vs crm.realty (locally uploaded data).
-- Join key: (state_tax_id, ownership_registration_date) — composite primary key.
--
-- Fields compared (with normalization where applicable):
--   taxpayer_name   — normalize_ua_text  (fixes Latin chars, collapses spaces)
--   object_type     — normalize_ua_text  (fixes Latin i: "гаражi" → "гаражі")
--   object_address  — normalize_ua_location  (abbreviations, trailing garbage)
--   total_area      — numeric exact match
--   ownership_share — numeric exact match
-- =============================================================================
CREATE OR REPLACE VIEW v_realty_diff AS
SELECT
    -- Композитний ключ
    COALESCE(r.state_tax_id, c.state_tax_id)                                       AS state_tax_id,
    COALESCE(r.ownership_registration_date, c.ownership_registration_date)         AS ownership_registration_date,

    CASE
        WHEN c.state_tax_id IS NULL THEN 'NEW_IN_REGISTRY'
        WHEN r.state_tax_id IS NULL THEN 'MISSING_IN_REGISTRY'
        WHEN normalize_ua_text(r.taxpayer_name)      IS DISTINCT FROM normalize_ua_text(c.taxpayer_name)
          OR normalize_ua_text(r.object_type)         IS DISTINCT FROM normalize_ua_text(c.object_type)
          OR normalize_ua_location(r.object_address)  IS DISTINCT FROM normalize_ua_location(c.object_address)
          OR r.total_area                             IS DISTINCT FROM c.total_area
          OR r.ownership_share                        IS DISTINCT FROM c.ownership_share
        THEN 'CONFLICT'
        ELSE 'MATCH'
    END AS diff_status,

    -- Дані Реєстру (Еталон) — оригінальні значення
    r.taxpayer_name     AS registry_taxpayer_name,
    r.object_address    AS registry_address,
    r.total_area        AS registry_total_area,
    r.ownership_share   AS registry_ownership_share,

    -- Дані локальної CRM — оригінальні значення
    c.taxpayer_name     AS crm_taxpayer_name,
    c.object_address    AS crm_address,
    c.total_area        AS crm_total_area,
    c.ownership_share   AS crm_ownership_share

FROM registry.realty r
FULL OUTER JOIN crm.realty c
    ON r.state_tax_id = c.state_tax_id
    AND r.ownership_registration_date = c.ownership_registration_date;

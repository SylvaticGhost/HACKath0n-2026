CREATE OR REPLACE VIEW v_land_diff AS
SELECT
    -- Унікальний ключ ділянки
    COALESCE(r.cadastral_number, c.cadastral_number) AS cadastral_number,

    -- Логіка визначення статусу розбіжності
    CASE
        WHEN c.cadastral_number IS NULL THEN 'NEW_IN_REGISTRY'
        WHEN r.cadastral_number IS NULL THEN 'MISSING_IN_REGISTRY'
        WHEN r.state_tax_id IS DISTINCT FROM c.state_tax_id
          OR r."user" IS DISTINCT FROM c."user"
          OR r.square IS DISTINCT FROM c.square
          OR r.estimate_value IS DISTINCT FROM c.estimate_value
          OR r.ownership_type IS DISTINCT FROM c.ownership_type
          OR r.location IS DISTINCT FROM c.location
          OR r.owner_part IS DISTINCT FROM c.owner_part
        THEN 'CONFLICT'
        ELSE 'MATCH'
    END AS diff_status,

    -- РОЗРАХУНОК СКОРУ (Схожості)
    CASE
        WHEN c.cadastral_number IS NULL OR r.cadastral_number IS NULL THEN 0
        WHEN r.state_tax_id IS DISTINCT FROM c.state_tax_id
          OR r."user" IS DISTINCT FROM c."user"
          OR r.square IS DISTINCT FROM c.square
          OR r.estimate_value IS DISTINCT FROM c.estimate_value
          OR r.ownership_type IS DISTINCT FROM c.ownership_type
          OR r.location IS DISTINCT FROM c.location
          OR r.owner_part IS DISTINCT FROM c.owner_part
        THEN crm.calculate_land_similarity(c, r) -- Викликаємо нашу нову функцію
        ELSE 100
    END AS similarity_score,

    -- Дані Реєстру (Еталон)
    r.state_tax_id AS registry_tax_id,
    r."user" AS registry_user,
    r.square AS registry_square,
    r.estimate_value AS registry_estimate_value,
    r.location AS registry_location,

    -- Дані локальної CRM
    c.state_tax_id AS crm_tax_id,
    c."user" AS crm_user,
    c.square AS crm_square,
    c.estimate_value AS crm_estimate_value,
    c.location AS crm_location,

    -- Валідація CRM-запису
    c.validation_status AS crm_validation_status,
    c.validation_errors AS crm_validation_errors

-- Використовуємо нормалізоване view для реєстру
FROM crm.normalized_registry_land r
FULL OUTER JOIN crm.land c
    ON r.cadastral_number = c.cadastral_number;

CREATE OR REPLACE VIEW v_realty_diff AS
SELECT
    -- Композитний ключ
    COALESCE(r.state_tax_id, c.state_tax_id) AS state_tax_id,
    COALESCE(r.ownership_registration_date, c.ownership_registration_date) AS ownership_registration_date,

    -- Логіка визначення статусу розбіжності
    CASE
        WHEN c.state_tax_id IS NULL THEN 'NEW_IN_REGISTRY'
        WHEN r.state_tax_id IS NULL THEN 'MISSING_IN_REGISTRY'
        WHEN r.taxpayer_name IS DISTINCT FROM c.taxpayer_name
          OR r.object_type IS DISTINCT FROM c.object_type
          OR r.object_address IS DISTINCT FROM c.object_address
          OR r.total_area IS DISTINCT FROM c.total_area
          OR r.ownership_share IS DISTINCT FROM c.ownership_share
        THEN 'CONFLICT'
        ELSE 'MATCH'
    END AS diff_status,

    -- РОЗРАХУНОК СКОРУ (Схожості)
    CASE
        WHEN c.state_tax_id IS NULL OR r.state_tax_id IS NULL THEN 0
        WHEN r.taxpayer_name IS DISTINCT FROM c.taxpayer_name
          OR r.object_type IS DISTINCT FROM c.object_type
          OR r.object_address IS DISTINCT FROM c.object_address
          OR r.total_area IS DISTINCT FROM c.total_area
          OR r.ownership_share IS DISTINCT FROM c.ownership_share
        -- Кастування більше не потрібне, оскільки "r" вже є типом crm.normalized_registry_realty
        THEN crm.calculate_realty_similarity(c, r)
        ELSE 100
    END AS similarity_score,

    -- Дані Реєстру (Еталон)
    r.taxpayer_name AS registry_taxpayer_name,
    r.object_address AS registry_address,
    r.total_area AS registry_total_area,
    r.ownership_share AS registry_ownership_share,

    -- Дані локальної CRM
    c.taxpayer_name AS crm_taxpayer_name,
    c.object_address AS crm_address,
    c.total_area AS crm_total_area,
    c.ownership_share AS crm_ownership_share,

    -- Валідація CRM-запису
    c.validation_status AS crm_validation_status,
    c.validation_errors AS crm_validation_errors

-- ЗМІНА ТУТ: Використовуємо нормалізоване view замість базової таблиці
FROM crm.normalized_registry_realty r
FULL OUTER JOIN crm.realty c
    ON r.state_tax_id = c.state_tax_id
    AND r.ownership_registration_date = c.ownership_registration_date;

-- ── Податок на землю (crm schema) ─────────────────────────────────────────────
CREATE OR REPLACE VIEW crm.v_land_tax AS
WITH tax_params AS (
    SELECT
        cadastral_number,
        state_tax_id,
        "user",
        location,
        land_purpose_type,
        ownership_type,
        square,
        estimate_value,
        COALESCE(owner_part, 1) AS owner_part,
        validation_status,
        -- Ставка залежно від типу землі та платника
        CASE
            WHEN LENGTH(state_tax_id) = 8
             AND ownership_type ILIKE '%постійн%'         THEN 0.12   -- юрособи, постійне користування
            WHEN land_purpose_type LIKE '01.%'             THEN 0.01   -- сільгоспугіддя, макс ОТГ
            WHEN land_purpose_type LIKE '09.%'             THEN 0.001  -- лісові землі
            ELSE                                                0.03    -- решта (житлова, комерційна тощо)
        END AS tax_rate
    FROM crm.land
)
SELECT
    cadastral_number,
    state_tax_id,
    CASE WHEN LENGTH(state_tax_id) = 8 THEN 'legal_entity' ELSE 'individual' END AS taxpayer_type,
    "user",
    location,
    land_purpose_type,
    ownership_type,
    ROUND(square::NUMERIC, 4)               AS square,
    ROUND(estimate_value::NUMERIC, 2)       AS ngo_uah,
    1.08::FLOAT8                            AS indexation_coefficient,
    tax_rate::FLOAT8                        AS tax_rate,
    ROUND(owner_part::NUMERIC, 4)           AS owner_part,
    CASE
        WHEN estimate_value IS NULL OR estimate_value = 0 THEN NULL
        ELSE ROUND((estimate_value * 1.08 * tax_rate * owner_part)::NUMERIC, 2)
    END                                     AS annual_tax_uah,
    validation_status
FROM tax_params;

-- ── Податок на нерухомість (crm schema) ───────────────────────────────────────
CREATE OR REPLACE VIEW crm.v_realty_tax AS
WITH tax_params AS (
  SELECT
    state_tax_id,
    ownership_registration_date,
    ownership_termination_date,
    taxpayer_name,
    object_type,
    object_address,
    total_area,
    -- Частка як пропорція 0..1 (у джерелі "частка" збережена у м², не у відсотках)
    CASE
      WHEN ownership_share IS NULL                             THEN 1.0
      WHEN total_area IS NULL OR total_area = 0                THEN 1.0
      WHEN ABS(ownership_share - total_area) / total_area < 0.01 THEN 1.0
      WHEN ownership_share <= total_area                       THEN ownership_share / total_area
      ELSE                                                          1.0
      END                                                         AS ownership_share,
    validation_status,
    -- Пільгова площа залежно від типу об'єкта
    CASE
      WHEN object_type ILIKE '%квартир%'                            THEN 60
      WHEN object_type ILIKE '%будинок%'
        OR object_type ILIKE '%будинку%'
        OR object_type ILIKE '%садов%'
        OR object_type ILIKE '%дачн%'                               THEN 120
      ELSE                                                               180
      END AS exempt_area
  FROM crm.realty
  WHERE ownership_termination_date IS NULL
     OR ownership_termination_date > CURRENT_DATE
),
     calc AS (
       SELECT
         *,
         GREATEST(0, total_area - exempt_area) AS taxable_area,
         8000                                  AS min_wage_uah,   -- МЗП на 01.01.2025 (звіт 2025 → сплата 2026)
         0.015                                 AS tax_rate,       -- 1.5% від МЗП/м² — макс ОТГ
         -- Luxury (пп. 266.7.1.1 "ґ" ПКУ): +25 000 грн/рік ФІКСОВАНО за КОЖЕН такий об'єкт
         -- Квартира >300 м² → +25 000; Будинок >500 м² → +25 000
         CASE
           WHEN exempt_area = 60  AND total_area > 300 THEN 25000
           WHEN exempt_area = 120 AND total_area > 500 THEN 25000
           ELSE 0
           END AS luxury_tax_uah
       FROM tax_params
     )
SELECT
  state_tax_id,
  ownership_registration_date,
  ownership_termination_date,
  taxpayer_name,
  object_type,
  object_address,
  ROUND(total_area::NUMERIC, 2)                             AS total_area,
  exempt_area                                               AS exempt_area_m2,
  ROUND(taxable_area::NUMERIC, 2)                           AS taxable_area_m2,
  min_wage_uah,
  tax_rate::FLOAT8                                          AS tax_rate,
  ROUND(ownership_share::NUMERIC, 4)                        AS ownership_share,
  ROUND((taxable_area * min_wage_uah * tax_rate * ownership_share)::NUMERIC, 2)
                                                            AS base_tax_uah,
  ROUND((luxury_tax_uah * ownership_share)::NUMERIC, 2)     AS luxury_tax_uah,
  ROUND(
    ((taxable_area * min_wage_uah * tax_rate + luxury_tax_uah) * ownership_share)::NUMERIC,
    2)                                                        AS annual_tax_uah,
  validation_status
FROM calc;

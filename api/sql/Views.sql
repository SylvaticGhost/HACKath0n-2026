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

CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE IF NOT EXISTS crm.land (
  cadastral_number          VARCHAR(22)        PRIMARY KEY,
  koatuu                    VARCHAR(10)        ,
  ownership_type            text       ,
  intended_purpose          TEXT               ,
  location                  TEXT               ,
  land_purpose_type         VARCHAR(255)       ,
  square                    NUMERIC(12, 4)     ,
  estimate_value            NUMERIC(15, 2)     ,
  state_tax_id              VARCHAR(10)        ,
  "user"                    VARCHAR(255)       ,
  owner_part                NUMERIC(5, 4),
  state_registration_date   DATE               ,
  ownership_registration_id text       ,
  registrator               VARCHAR(255)       ,
  type                      text       ,
  subtype                   text       ,
  validation_status         VARCHAR(10),
  validation_errors         TEXT[]
);

CREATE TABLE IF NOT EXISTS crm.realty (
  state_tax_id                    VARCHAR(10)        ,
  taxpayer_name                   VARCHAR(255)       ,
  object_type                     text       ,
  object_address                  TEXT               ,
  ownership_registration_date     DATE               ,
  ownership_termination_date      DATE,
  total_area                      NUMERIC(12, 4)     ,
  joint_ownership_type            text,
  ownership_share                 NUMERIC(5, 4),
  validation_status               VARCHAR(10),
  validation_errors               TEXT[],
  PRIMARY KEY (state_tax_id, ownership_registration_date)
);

CREATE VIEW crm.normalized_registry_land AS
SELECT
    cadastral_number,
    koatuu,
    ownership_type,
    intended_purpose,
    location,
    land_purpose_type,
    square,
    estimate_value,
    state_tax_id,
    "user",
    owner_part,
    state_registration_date,
    ownership_registration_id,
    registrator,
    type,
    subtype
FROM registry.land;

CREATE VIEW crm.normalized_registry_realty AS
SELECT
    state_tax_id,
    taxpayer_name,
    object_type,
    object_address,
    ownership_registration_date,
    ownership_termination_date,
    total_area,
    joint_ownership_type,
    ownership_share
FROM registry.realty;

CREATE OR REPLACE FUNCTION crm.calculate_realty_similarity(
    crm_row crm.realty,
    reg_row crm.normalized_registry_realty
)
RETURNS NUMERIC AS $$
DECLARE
    penalty NUMERIC := 0;
    max_score NUMERIC := 40; -- Загальна база балів (4 параметри по 10 балів)
    area_diff_ratio NUMERIC;
    similarity_percent NUMERIC;
BEGIN
    -- 1. Розрахунок штрафу по площі (пропорційно, але не більше 10 балів)
    IF crm_row.total_area IS DISTINCT FROM reg_row.total_area THEN
        -- Якщо хоча б одне значення NULL, або обидва нулі — максимальний штраф 10
        IF crm_row.total_area IS NULL OR reg_row.total_area IS NULL OR GREATEST(crm_row.total_area, reg_row.total_area) = 0 THEN
            penalty := penalty + 10;
        ELSE
            -- Пропорція: (Різниця / Найбільше значення) * 10
            -- Наприклад, площа 100 і 90: різниця 10. (10 / 100) * 10 = 1 бал штрафу.
            area_diff_ratio := ABS(crm_row.total_area - reg_row.total_area) / GREATEST(crm_row.total_area, reg_row.total_area);
            penalty := penalty + LEAST(10, area_diff_ratio * 10);
        END IF;
    END IF;

    -- 2. Штраф за ПІБ (10 балів)
    IF crm_row.taxpayer_name IS DISTINCT FROM reg_row.taxpayer_name THEN
        penalty := penalty + 10;
    END IF;

    -- 3. Штраф за тип об'єкта (10 балів)
    IF crm_row.object_type IS DISTINCT FROM reg_row.object_type THEN
        penalty := penalty + 10;
    END IF;

    -- 4. Штраф за адресу (10 балів)
    IF crm_row.object_address IS DISTINCT FROM reg_row.object_address THEN
        penalty := penalty + 10;
    END IF;

    -- Розраховуємо відсоток схожості (100% - ідеальний збіг, 0% - нічого не збігається)
    similarity_percent := ROUND(((max_score - penalty) / max_score) * 100, 2);

    RETURN similarity_percent;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION crm.calculate_land_similarity(
    crm_row crm.land,
    reg_row crm.normalized_registry_land
)
RETURNS NUMERIC AS $$
DECLARE
    penalty NUMERIC := 0;
    max_score NUMERIC := 60; -- База: 6 параметрів по 10 балів
    diff_ratio NUMERIC;
    similarity_percent NUMERIC;
BEGIN
    -- 1. Штраф за площу (пропорційно до 10 балів)
    IF crm_row.square IS DISTINCT FROM reg_row.square THEN
        IF crm_row.square IS NULL OR reg_row.square IS NULL OR GREATEST(crm_row.square, reg_row.square) = 0 THEN
            penalty := penalty + 10;
        ELSE
            diff_ratio := ABS(crm_row.square - reg_row.square) / GREATEST(crm_row.square, reg_row.square);
            penalty := penalty + LEAST(10, diff_ratio * 10);
        END IF;
    END IF;

    -- 2. Штраф за оціночну вартість (пропорційно до 10 балів)
    IF crm_row.estimate_value IS DISTINCT FROM reg_row.estimate_value THEN
        IF crm_row.estimate_value IS NULL OR reg_row.estimate_value IS NULL OR GREATEST(crm_row.estimate_value, reg_row.estimate_value) = 0 THEN
            penalty := penalty + 10;
        ELSE
            diff_ratio := ABS(crm_row.estimate_value - reg_row.estimate_value) / GREATEST(crm_row.estimate_value, reg_row.estimate_value);
            penalty := penalty + LEAST(10, diff_ratio * 10);
        END IF;
    END IF;

    -- 3. Штраф за ПІБ/Користувача (10 балів)
    IF crm_row."user" IS DISTINCT FROM reg_row."user" THEN
        penalty := penalty + 10;
    END IF;

    -- 4. Штраф за розташування/адресу (10 балів)
    IF crm_row.location IS DISTINCT FROM reg_row.location THEN
        penalty := penalty + 10;
    END IF;

    -- 5. Штраф за ІПН/ЄДРПОУ (10 балів)
    IF crm_row.state_tax_id IS DISTINCT FROM reg_row.state_tax_id THEN
        penalty := penalty + 10;
    END IF;

    -- 6. Штраф за тип власності (10 балів)
    IF crm_row.ownership_type IS DISTINCT FROM reg_row.ownership_type THEN
        penalty := penalty + 10;
    END IF;

    -- Розраховуємо відсоток схожості
    similarity_percent := ROUND(((max_score - penalty) / max_score) * 100, 2);

    RETURN similarity_percent;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE VIEW crm.last_land_status AS
SELECT DISTINCT ON (cadastral_number)
    cadastral_number,
    koatuu,
    ownership_type,
    intended_purpose,
    location,
    land_purpose_type,
    square,
    estimate_value,
    state_tax_id,
    "user",
    owner_part,
    state_registration_date,
    ownership_registration_id,
    registrator,
    type,
    subtype
FROM registry.land  -- Використовуємо таблицю, де лежить вся історія
ORDER BY cadastral_number, state_registration_date DESC, ownership_registration_id DESC;

-- 1. Створюємо індекси для швидкого пошуку по ІПН/ЄДРПОУ
CREATE INDEX idx_crm_realty_tax_id ON crm.realty (state_tax_id);
-- CREATE INDEX idx_registry_land_tax_id ON registry.land (state_tax_id);

-- 2. Створюємо GIN-індекси для швидкого нечіткого пошуку тексту адрес
CREATE INDEX idx_crm_realty_address_trgm ON crm.realty USING GIN (object_address gin_trgm_ops);
-- CREATE INDEX idx_registry_land_location_trgm ON registry.land USING GIN (location gin_trgm_ops);


CREATE OR REPLACE FUNCTION crm.clean_address(raw_address TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    IF raw_address IS NULL THEN RETURN ''; END IF;

    -- 1. Переводимо в нижній регістр
    cleaned := LOWER(raw_address);

    -- 2. Відрізаємо всю географію ДО назви вулиці/провулка
    cleaned := REGEXP_REPLACE(cleaned, '.*(вулиця|вул\.|вул|провулок|пров\.|пров|площа|пл\.|пл|бульвар|бульв|проспект|просп|ш\.)\s*', '', 'g');

    -- 3. Забираємо пунктуацію та символ "№"
    cleaned := REGEXP_REPLACE(cleaned, '[,.\-"''№/]', ' ', 'g');

    -- 4. ТОТАЛЬНА ЗАЧИСТКА СТОП-СЛІВ
    cleaned := REGEXP_REPLACE(cleaned, '\y(вулиця|вул|будинок|буд|квартира|кв|приміщення|прим|гараж|ділянка|корпус|блок|n|н)\y', ' ', 'g');

    -- 5. Зачистка назв міст/регіонів
    cleaned := REGEXP_REPLACE(cleaned, '\y(львівська|область|обл|район|місто|м|село|с|смт|селище|присілок|сокальський|червоноградський|червоноград|соснiвка|соснівка|гірник)\y', ' ', 'g');

    -- 6. Забираємо множинні пробіли
    cleaned := REGEXP_REPLACE(cleaned, '\s+', ' ', 'g');

    RETURN TRIM(cleaned);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION crm.extract_house_num(raw_address TEXT)
RETURNS TEXT AS $$
DECLARE
    match TEXT;
BEGIN
    IF raw_address IS NULL THEN RETURN ''; END IF;
    -- Шукаємо перше число, можливо з літерою
    match := SUBSTRING(raw_address FROM '\y\d+[а-яА-Яa-zA-Z]?\y');
    RETURN COALESCE(match, '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;




CREATE OR REPLACE VIEW crm.v_land_realty_mapping AS

WITH cleaned_land AS (
    SELECT
        cadastral_number,
        location AS land_address,
        NULLIF(TRIM(state_tax_id), '') AS tax_id,
        intended_purpose,
        crm.clean_address(location) AS cln_land,
        crm.extract_house_num(location) AS hn_land
    FROM crm.land
),
cleaned_realty AS (
    SELECT
        object_address AS realty_address,
        NULLIF(TRIM(state_tax_id), '') AS tax_id,
        crm.clean_address(object_address) AS cln_realty,
        crm.extract_house_num(object_address) AS hn_realty,
        object_type
    FROM crm.realty
),

-- Стратегія 1: За ІПН
match_tax AS (
    SELECT
        l.cadastral_number,
        l.land_address,
        r.realty_address,
        l.intended_purpose,
        l.tax_id AS land_tax_id,
        r.tax_id AS realty_tax_id,
        r.object_type,
        l.cln_land,
        r.cln_realty,
        l.hn_land,
        r.hn_realty,
        'TAX_ID' AS match_strategy,
        CASE
            WHEN l.cln_land = r.cln_realty THEN 1.0
            ELSE COALESCE(word_similarity(r.cln_realty, l.cln_land), 0)
        END AS sim_score
    FROM cleaned_land l
    JOIN cleaned_realty r ON l.tax_id = r.tax_id AND l.tax_id IS NOT NULL
),

-- Стратегія 2: За адресою та номером будинку
match_addr AS (
    SELECT
        l.cadastral_number,
        l.land_address,
        r.realty_address,
        l.intended_purpose,
        l.tax_id AS land_tax_id,
        r.tax_id AS realty_tax_id,
        r.object_type,
        l.cln_land,
        r.cln_realty,
        l.hn_land,
        r.hn_realty,
        'EXACT_ADDRESS' AS match_strategy,
        1.0 AS sim_score
    FROM cleaned_land l
    JOIN cleaned_realty r ON l.cln_land = r.cln_realty AND l.hn_land = r.hn_realty AND l.cln_land != '' AND l.hn_land != ''
),

all_matches AS (
    SELECT * FROM match_tax
    UNION ALL
    SELECT * FROM match_addr
),

best_matches AS (
    SELECT DISTINCT ON (cadastral_number) *
    FROM all_matches
    ORDER BY cadastral_number, sim_score DESC
),

final_mapping AS (
    SELECT
        l.cadastral_number,
        l.land_address,
        bm.realty_address,
        bm.sim_score,
        bm.match_strategy,
        bm.realty_tax_id,
        bm.land_tax_id,
        bm.object_type,
        l.intended_purpose,
        COALESCE(bm.hn_land, l.hn_land) as hn_land,
        bm.hn_realty
    FROM cleaned_land l
    LEFT JOIN best_matches bm ON l.cadastral_number = bm.cadastral_number
)

SELECT
    cadastral_number,
    land_address,
    realty_address,
    ROUND((COALESCE(sim_score, -1.0) * 100)::numeric, 2) AS match_score,

    CASE
        -- 1. СІРА / ЧЕРВОНА: Немає жодного збігу
        WHEN sim_score IS NULL OR sim_score = -1.0 THEN
            CASE
                WHEN intended_purpose ~* '(01\.|рілля|сільськогосподарського)'
                    THEN '⚪ СІРА ЗОНА: Вільна с/г ділянка (Норма)'
                ELSE '🔴 ЧЕРВОНА ЗОНА: Можлива тіньова забудова (Не знайдено майна)'
            END

        -- 2. ЖОВТА: Точна адреса, але власники різні
        WHEN match_strategy = 'EXACT_ADDRESS' AND land_tax_id IS DISTINCT FROM realty_tax_id THEN
            '🟡 ЖОВТА ЗОНА: Конфлікт власників (Адреса збігається, власники різні)'

        -- 3. ПЕРЕВІРКА ЛОКАЦІЇ
        WHEN sim_score >= 0.80 AND hn_land = hn_realty AND hn_land <> '' THEN
            CASE
                -- Конфлікт типів
                WHEN object_type ~* 'квартира' AND (intended_purpose ~* '02\.01' OR intended_purpose ~* 'присадибн')
                    THEN '🔴 ЧЕРВОНА ЗОНА: Конфлікт типів об''єктів (Квартира на присадибній ділянці)'
                ELSE
                    '🟢 ЗЕЛЕНА ЗОНА: Підтверджений об''єкт (Збіг ІПН та Локації)'
            END

        -- 4. Якщо локації різні
        ELSE
            '🟡 ЖОВТА ЗОНА: Розбіжність адрес (Власник той самий, адреса інша)'
    END AS match_reason

FROM final_mapping;

CREATE TABLE crm.anomalies (
  id SERIAL PRIMARY KEY,
  cadastral_number VARCHAR(22),
  land_address TEXT,
  realty_address TEXT,
  match_score NUMERIC(5, 2),
  match_reason TEXT,
  status VARCHAR(20) DEFAULT 'UNRESOLVED'
);

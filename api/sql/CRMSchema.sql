CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE IF NOT EXISTS crm.land (
  cadastral_number          VARCHAR(22)        PRIMARY KEY,
  koatuu                    VARCHAR(10)        NOT NULL,
  ownership_type            text       NOT NULL,
  intended_purpose          TEXT               NOT NULL,
  location                  TEXT               NOT NULL,
  land_purpose_type         VARCHAR(255)       NOT NULL,
  square                    NUMERIC(12, 4)     NOT NULL,
  estimate_value            NUMERIC(15, 2)     NOT NULL,
  state_tax_id              VARCHAR(10)        NOT NULL,
  "user"                    VARCHAR(255)       NOT NULL,
  owner_part                NUMERIC(5, 4),
  state_registration_date   DATE               NOT NULL,
  ownership_registration_id text       NOT NULL,
  registrator               VARCHAR(255)       NOT NULL,
  type                      text       NOT NULL,
  subtype                   text       NOT NULL,
  validation_status         VARCHAR(10),
  validation_errors         TEXT[]
);

CREATE TABLE IF NOT EXISTS crm.realty (
  state_tax_id                    VARCHAR(10)        NOT NULL,
  taxpayer_name                   VARCHAR(255)       NOT NULL,
  object_type                     VARCHAR(100)       NOT NULL,
  object_address                  TEXT               NOT NULL,
  ownership_registration_date     DATE               NOT NULL,
  ownership_termination_date      DATE,
  total_area                      NUMERIC(12, 4)     NOT NULL,
  joint_ownership_type            VARCHAR(100),
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
CREATE INDEX idx_registry_land_tax_id ON registry.land (state_tax_id);

-- 2. Створюємо GIN-індекси для швидкого нечіткого пошуку тексту адрес
CREATE INDEX idx_crm_realty_address_trgm ON crm.realty USING GIN (object_address gin_trgm_ops);
CREATE INDEX idx_registry_land_location_trgm ON registry.land USING GIN (location gin_trgm_ops);


CREATE OR REPLACE FUNCTION crm.clean_address(raw_address TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    IF raw_address IS NULL THEN RETURN NULL; END IF;

    -- 1. Переводимо в нижній регістр
    cleaned := LOWER(raw_address);

    -- 2. Видаляємо пунктуацію (коми, крапки, дефіси, лапки) і замінюємо на пробіли
    cleaned := REGEXP_REPLACE(cleaned, '[,.\-"'']', ' ', 'g');

    -- 3. Видаляємо типові слова (використовуємо \y для позначення меж цілих слів, щоб не обрізати частину назви)
    -- Додано 'львівська' та 'область', оскільки вони є у всіх записах і не несуть унікальної цінності
    cleaned := REGEXP_REPLACE(cleaned, '\y(львівська|область|обл|район|місто|м|село|с|смт|вулиця|вул|будинок|буд|квартира|кв|приміщення|прим)\y', ' ', 'g');

    -- 4. Видаляємо множинні пробіли, які утворилися після видалення слів
    cleaned := REGEXP_REPLACE(cleaned, '\s+', ' ', 'g');

    RETURN TRIM(cleaned);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE VIEW crm.v_land_realty_mapping AS

WITH target_land AS (
    -- Фільтруємо лише ділянки з вулицями
    SELECT
        cadastral_number,
        location AS land_address,
        state_tax_id AS land_tax_id,
        crm.clean_address(location) AS cln,
        SUBSTRING(location FROM '\d+') AS hn
    FROM crm.land
    WHERE location ~* '(вул|пров|просп|площ|бульв|ш\.)'
),
prepared_realty AS (
    -- Підготовка нерухомості
    SELECT
        object_address AS realty_address,
        state_tax_id AS realty_tax_id,
        crm.clean_address(object_address) AS cln,
        SUBSTRING(object_address FROM '\d+') AS hn
    FROM crm.realty
),

-- 1. ЗБИРАЄМО ВСІ МОЖЛИВІ ЗБІГИ (Без обмежень)
all_matches AS (
    -- Стратегія 1: Збіг по ІПН (Найвищий пріоритет - 100 балів)
    SELECT l.cadastral_number, r.realty_address, 100 AS score, 'Ідеальний збіг (ІПН)' AS method
    FROM target_land l JOIN prepared_realty r ON l.land_tax_id = r.realty_tax_id

    UNION ALL

    -- Стратегія 2: Точний збіг адрес (80 балів)
    SELECT l.cadastral_number, r.realty_address, 80 AS score, 'Точний збіг за Адресою (Різні власники)' AS method
    FROM target_land l JOIN prepared_realty r ON l.cln = r.cln

    UNION ALL

    -- Стратегія 3: Жадібний пошук (60 балів) - Тільки в межах однакового номера будинку
    SELECT l.cadastral_number, r.realty_address, 60 AS score, 'Ймовірний збіг (Один будинок + схожий текст)' AS method
    FROM target_land l JOIN prepared_realty r ON l.hn = r.hn AND l.hn IS NOT NULL
    WHERE r.cln <% l.cln
),

-- 2. ВІДБИРАЄМО НАЙКРАЩИЙ ЗБІГ ДЛЯ КОЖНОЇ ДІЛЯНКИ
best_matches AS (
    SELECT DISTINCT ON (cadastral_number) *
    FROM all_matches
    -- Сортуємо так, щоб нагору сплив збіг з найбільшим балом
    ORDER BY cadastral_number, score DESC
)

-- 3. ФІНАЛЬНИЙ РЕЗУЛЬТАТ (Зберігаємо всі ділянки!)
SELECT
    l.cadastral_number,
    l.land_address,
    m.realty_address,
    COALESCE(m.score, 0) AS match_score,

    -- ЯКЩО m.score є NULL, значить ділянка не знайшла збігу ні в одній стратегії
    COALESCE(m.method, 'АНОМАЛІЯ: Будівлю не знайдено (На ділянці немає зареєстрованої нерухомості)') AS match_reason

FROM target_land l
-- ВИРІШАЛЬНА ЗМІНА: LEFT JOIN гарантує, що ділянки без нерухомості залишаться в таблиці
LEFT JOIN best_matches m ON l.cadastral_number = m.cadastral_number;

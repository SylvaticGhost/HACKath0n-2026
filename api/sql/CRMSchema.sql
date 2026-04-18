CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE IF NOT EXISTS crm.land (
  cadastral_number          VARCHAR(22)        PRIMARY KEY,
  koatuu                    VARCHAR(10),
  ownership_type            VARCHAR(100),
  intended_purpose          TEXT,
  location                  TEXT,
  land_purpose_type         VARCHAR(255),
  square                    NUMERIC(12, 4),
  estimate_value            NUMERIC(15, 2),
  state_tax_id              VARCHAR(10),
  "user"                    VARCHAR(255),
  owner_part                NUMERIC(5, 4),
  state_registration_date   DATE,
  ownership_registration_id VARCHAR(100),
  registrator               VARCHAR(255),
  type                      VARCHAR(100),
  subtype                   VARCHAR(100),
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

CREATE OR REPLACE FUNCTION crm.calculate_realty_similarity(
    crm_row crm.realty,
    reg_row registry.realty
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
    reg_row registry.land
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

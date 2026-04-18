CREATE SCHEMA IF NOT EXISTS registry;

CREATE TABLE IF NOT EXISTS registry.land (
  ownership_registration_id VARCHAR(100)       PRIMARY KEY,
  cadastral_number          VARCHAR(22),
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
  registrator               VARCHAR(255),
  type                      VARCHAR(100),
  subtype                   VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS registry.realty (
  state_tax_id                    VARCHAR(10)        NOT NULL,
  taxpayer_name                   VARCHAR(255)       NOT NULL,
  object_type                     VARCHAR(100)       NOT NULL,
  object_address                  TEXT               NOT NULL,
  ownership_registration_date     DATE               NOT NULL,
  ownership_termination_date      DATE,
  total_area                      NUMERIC(12, 4)     NOT NULL,
  joint_ownership_type            VARCHAR(100),
  ownership_share                 NUMERIC(5, 4),
  PRIMARY KEY (state_tax_id, ownership_registration_date)
);
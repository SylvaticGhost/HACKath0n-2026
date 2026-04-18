CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE IF NOT EXISTS crm.land (
  cadastral_number          VARCHAR(22)        PRIMARY KEY,
  koatuu                    VARCHAR(10)        NOT NULL,
  ownership_type            VARCHAR(100)       NOT NULL,
  intended_purpose          TEXT               NOT NULL,
  location                  TEXT               NOT NULL,
  land_purpose_type         VARCHAR(255)       NOT NULL,
  square                    NUMERIC(12, 4)     NOT NULL,
  estimate_value            NUMERIC(15, 2)     NOT NULL,
  state_tax_id              VARCHAR(10)        NOT NULL,
  "user"                    VARCHAR(255)       NOT NULL,
  owner_part                NUMERIC(5, 4),
  state_registration_date   DATE               NOT NULL,
  ownership_registration_id VARCHAR(100)       NOT NULL,
  registrator               VARCHAR(255)       NOT NULL,
  type                      VARCHAR(100)       NOT NULL,
  subtype                   VARCHAR(100)       NOT NULL
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
  PRIMARY KEY (state_tax_id, ownership_registration_date)
);
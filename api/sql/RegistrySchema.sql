CREATE SCHEMA IF NOT EXISTS registry;

CREATE TABLE IF NOT EXISTS registry.land (
  cadastral_number          VARCHAR(22)        PRIMARY KEY,
  koatuu                    text        ,
  ownership_type            VARCHAR(255)       ,
  intended_purpose          TEXT               ,
  location                  TEXT               ,
  land_purpose_type         VARCHAR(255)       ,
  square                    NUMERIC(12, 4)     ,
  estimate_value            NUMERIC(15, 2)     ,
  state_tax_id              text        ,
  "user"                    VARCHAR(255)       ,
  owner_part                NUMERIC(5, 4),
  state_registration_date   DATE               ,
  ownership_registration_id VARCHAR(255)       ,
  registrator               VARCHAR(255)       ,
  type                      VARCHAR(255)       ,
  subtype                   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS registry.realty (
  state_tax_id                    text        ,
  taxpayer_name                   VARCHAR(255)       ,
  object_type                     VARCHAR(255)       ,
  object_address                  TEXT               ,
  ownership_registration_date     DATE               ,
  ownership_termination_date      DATE,
  total_area                      NUMERIC(12, 4)     ,
  joint_ownership_type            VARCHAR(255),
  ownership_share                 NUMERIC(5, 4),
  PRIMARY KEY (state_tax_id, ownership_registration_date)
);

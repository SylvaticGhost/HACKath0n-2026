import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { ValidationError, ValidationStatus } from '../../upload/land-processor'

@Entity({ name: 'land', schema: 'crm' })
export class LandCrm {
  @PrimaryColumn({ name: 'cadastral_number', type: 'varchar', length: 22 })
  cadastralNumber: string

  @Column({ name: 'koatuu', type: 'varchar', length: 10 })
  koatuu: string

  @Column({ name: 'ownership_type', type: 'varchar', length: 100 })
  ownershipType: string

  @Column({ name: 'intended_purpose', type: 'text' })
  intendedPurpose: string

  @Column({ name: 'location', type: 'text' })
  location: string

  @Column({ name: 'land_purpose_type', type: 'varchar', length: 255 })
  landPurposeType: string

  @Column({ name: 'square', type: 'numeric', precision: 12, scale: 4 })
  square: number

  @Column({ name: 'estimate_value', type: 'numeric', precision: 15, scale: 2 })
  estimateValue: number

  @Column({ name: 'state_tax_id', type: 'varchar', length: 10 })
  stateTaxId: string

  @Column({ name: 'user', type: 'varchar', length: 255 })
  user: string

  @Column({ name: 'owner_part', type: 'numeric', precision: 5, scale: 4, nullable: true })
  ownerPart?: number

  @Column({ name: 'state_registration_date', type: 'date' })
  stateRegistrationDate: Date

  @Column({ name: 'ownership_registration_id', type: 'varchar', length: 100 })
  ownershipRegistrationId: string

  @Column({ name: 'registrator', type: 'varchar', length: 255 })
  registrator: string

  @Column({ name: 'type', type: 'varchar', length: 100 })
  type: string

  @Column({ name: 'subtype', type: 'varchar', length: 100, nullable: true })
  subtype?: string

  @Column({ name: 'validation_status', type: 'varchar', length: 10, nullable: true })
  validationStatus?: ValidationStatus

  @Column({ name: 'validation_errors', type: 'text', array: true, nullable: true })
  validationErrors?: ValidationError[]
}

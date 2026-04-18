import { Column, Entity, PrimaryColumn } from 'typeorm'
import type { ValidationError, ValidationStatus } from '../../upload/land-processor'

@Entity({ name: 'realty', schema: 'crm' })
export class RealtyCrm {
  @PrimaryColumn({ name: 'state_tax_id', type: 'varchar', length: 10 })
  stateTaxId: string

  @PrimaryColumn({ name: 'ownership_registration_date', type: 'date' })
  ownershipRegistrationDate: Date

  @Column({ name: 'taxpayer_name', type: 'varchar', length: 255 })
  taxpayerName: string

  @Column({ name: 'object_type', type: 'varchar', length: 100 })
  objectType: string

  @Column({ name: 'object_address', type: 'text' })
  objectAddress: string

  @Column({ name: 'ownership_termination_date', type: 'date', nullable: true })
  ownershipTerminationDate?: Date

  @Column({ name: 'total_area', type: 'numeric', precision: 12, scale: 4 })
  totalArea: number

  @Column({ name: 'joint_ownership_type', type: 'varchar', length: 100, nullable: true })
  jointOwnershipType?: string

  @Column({ name: 'ownership_share', type: 'numeric', precision: 5, scale: 4, nullable: true })
  ownershipShare?: number

  @Column({ name: 'validation_status', type: 'varchar', length: 10, nullable: true })
  validationStatus?: ValidationStatus

  @Column({ name: 'validation_errors', type: 'text', array: true, nullable: true })
  validationErrors?: ValidationError[]
}

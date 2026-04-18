import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'land', schema: 'crm' })
export class LandCrm {
  @PrimaryColumn({ type: 'varchar', length: 22 })
  cadastralNumber: string

  @Column({ type: 'varchar', length: 10 })
  koatuu: string

  @Column({ type: 'varchar', length: 100 })
  ownershipType: string

  @Column({ type: 'text' })
  intendedPurpose: string

  @Column({ type: 'text' })
  location: string

  @Column({ type: 'varchar', length: 255 })
  landPurposeType: string

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  square: number

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  estimateValue: number

  @Column({ type: 'varchar', length: 10 })
  stateTaxId: string

  @Column({ type: 'varchar', length: 255 })
  user: string

  @Column({ type: 'numeric', precision: 5, scale: 4, nullable: true })
  ownerPart?: number

  @Column({ type: 'date' })
  stateRegistrationDate: Date

  @Column({ type: 'varchar', length: 100 })
  ownershipRegistrationId: string

  @Column({ type: 'varchar', length: 255 })
  registrator: string

  @Column({ type: 'varchar', length: 100 })
  type: string

  @Column({ type: 'varchar', length: 100 })
  subtype: string
}

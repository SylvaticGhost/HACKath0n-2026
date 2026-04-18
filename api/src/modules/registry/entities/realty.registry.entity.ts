import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'realty', schema: 'registry' })
export class RealtyRegistry {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  stateTaxId: string

  @PrimaryColumn({ type: 'date' })
  ownershipRegistrationDate: Date

  @Column({ type: 'varchar', length: 255 })
  taxpayerName: string

  @Column({ type: 'varchar', length: 100 })
  objectType: string

  @Column({ type: 'text' })
  objectAddress: string

  @Column({ type: 'date', nullable: true })
  ownershipTerminationDate?: Date

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  totalArea: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  jointOwnershipType?: string

  @Column({ type: 'numeric', precision: 5, scale: 4, nullable: true })
  ownershipShare?: number
}

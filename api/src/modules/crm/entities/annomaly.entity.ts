import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'anomalies', schema: 'crm' })
export class Anomaly {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'cadastral_number', type: 'varchar', length: 22, nullable: true })
  cadastralNumber: string | null

  @Column({ name: 'land_address', type: 'text', nullable: true })
  landAddress: string | null

  @Column({ name: 'realty_address', type: 'text', nullable: true })
  realtyAddress: string | null

  @Column({ name: 'match_score', type: 'numeric', precision: 5, scale: 2, nullable: true })
  matchScore: number | null

  @Column({ name: 'match_reason', type: 'text', nullable: true })
  matchReason: string | null

  @Column()
  status: string
}

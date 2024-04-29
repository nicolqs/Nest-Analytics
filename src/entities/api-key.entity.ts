import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity('api_key')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ unique: true, length: 255 })
  key: string

  @Column({ type: 'int4' })
  teamId: number

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ nullable: true, type: 'timestamptz' })
  expiresAt: Date
}

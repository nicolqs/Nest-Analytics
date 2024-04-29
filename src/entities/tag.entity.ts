import {
  Index,
  Entity,
  Column,
  Unique,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Tap } from './tap.entity'

@Entity({ name: 'tag' })
@Unique(['tagUid'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ type: 'int8' })
  tagUid: number

  @Index()
  @Column({ type: 'int4' })
  teamId: number

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @OneToMany(() => Tap, (tap) => tap.tag)
  taps: Tap[]
}

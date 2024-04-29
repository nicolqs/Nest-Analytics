import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Tag } from './tag.entity'

@Entity({ name: 'tap' })
export class Tap {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ type: 'int8' })
  tagUid: number

  @Column({ type: 'int4' })
  count: number

  @Index()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ManyToOne(() => Tag, (tag) => tag.taps)
  @JoinColumn({ name: 'tagUid', referencedColumnName: 'tagUid' })
  tag: Tag
}

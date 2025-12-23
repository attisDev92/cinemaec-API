import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Space } from './space.entity'
import { User } from '../../users/entities/user.entity'

export enum SpaceReviewDecisionEnum {
  APPROVE = 'approve',
  REQUEST_CHANGES = 'request_changes',
  REJECT = 'reject',
}

@Entity('space_reviews')
export class SpaceReview {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int', nullable: false })
  spaceId: number

  @Column({ type: 'int', nullable: false })
  reviewerUserId: number

  @Column({ type: 'enum', enum: SpaceReviewDecisionEnum, nullable: false })
  decision: SpaceReviewDecisionEnum

  @Column({ type: 'text', nullable: true })
  generalComment: string | null

  @Column({ type: 'jsonb', nullable: true })
  issues: Array<{
    field: string
    comment: string
    severity?: 'low' | 'medium' | 'high'
  }> | null

  @ManyToOne(() => Space, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spaceId' })
  space: Space

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewerUserId' })
  reviewer: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

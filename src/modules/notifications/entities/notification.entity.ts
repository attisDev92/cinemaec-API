import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

export enum NotificationTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int', nullable: false })
  userId: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @Column({ type: 'text', nullable: false })
  message: string

  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
    default: NotificationTypeEnum.INFO,
  })
  type: NotificationTypeEnum

  @Column({ type: 'boolean', default: false })
  isRead: boolean

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string | null

  @Column({ type: 'int', nullable: true })
  referenceId: number | null

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

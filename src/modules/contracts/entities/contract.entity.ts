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

export enum ContractTypeEnum {
  SPACE = 'space',
  CONTENT_BANK_USER = 'content_bank_user',
  DIPLOMATIC_MISSION = 'diplomatic_mission',
  OTHER = 'other',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int', nullable: false })
  userId: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  adminName: string

  @Column({ type: 'int', nullable: false })
  spaceId: number

  @Column({
    type: 'enum',
    enum: ContractTypeEnum,
    nullable: false,
  })
  contractType: ContractTypeEnum

  @Column({ type: 'text', nullable: false })
  documentUrl: string

  @Column({ type: 'timestamp', nullable: false })
  startDate: Date

  @Column({ type: 'timestamp', nullable: false })
  expirationDate: Date

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @UpdateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  createdAt: Date
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

export enum LegalStatus {
  NATURAL_PERSON = 'natural_person',
  LEGAL_ENTITY = 'legal_entity',
}

@Entity('users_profile')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  fullName: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  tradeName?: string | null

  @Column({
    type: 'enum',
    enum: LegalStatus,
  })
  legalStatus: LegalStatus

  @Column({ type: 'date', nullable: true })
  birthdate?: Date | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null

  @Column({ type: 'int', nullable: true })
  agreementDocumentId: number | null

  @Column({ type: 'boolean', default: false })
  hasUploadedAgreement: boolean

  @Column({ type: 'int', unique: true, nullable: false })
  userId: number

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @UpdateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  createdAt: Date
}

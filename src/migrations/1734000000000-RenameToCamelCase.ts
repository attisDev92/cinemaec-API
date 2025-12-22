import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameToCamelCase1734000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renombrar columnas de la tabla users
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "is_active" TO "isActive"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "email_verification_token" TO "emailVerificationToken"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "password_reset_token" TO "passwordResetToken"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "password_reset_expires" TO "passwordResetExpires"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "profile_id" TO "profileId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "last_login" TO "lastLogin"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt"`,
    )

    // Renombrar columnas de la tabla users_profile
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "full_name" TO "fullName"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "legal_name" TO "legalName"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "trade_name" TO "tradeName"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "legal_status" TO "legalStatus"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "user_id" TO "userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "created_at" TO "createdAt"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "updated_at" TO "updatedAt"`,
    )

    // Renombrar columnas de la tabla assets
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "user_id" TO "userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "document_type" TO "documentType"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "owner_type" TO "ownerType"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "owner_id" TO "ownerId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "firebase_path" TO "firebasePath"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "created_at" TO "createdAt"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "updated_at" TO "updatedAt"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir renombrado de columnas de la tabla users
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "isActive" TO "is_active"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "emailVerificationToken" TO "email_verification_token"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "passwordResetToken" TO "password_reset_token"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "passwordResetExpires" TO "password_reset_expires"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "profileId" TO "profile_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "lastLogin" TO "last_login"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at"`,
    )

    // Revertir renombrado de columnas de la tabla users_profile
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "fullName" TO "full_name"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "legalName" TO "legal_name"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "tradeName" TO "trade_name"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "legalStatus" TO "legal_status"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "userId" TO "user_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "createdAt" TO "created_at"`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_profile" RENAME COLUMN "updatedAt" TO "updated_at"`,
    )

    // Revertir renombrado de columnas de la tabla assets
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "userId" TO "user_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "documentType" TO "document_type"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "ownerType" TO "owner_type"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "ownerId" TO "owner_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "firebasePath" TO "firebase_path"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "createdAt" TO "created_at"`,
    )
    await queryRunner.query(
      `ALTER TABLE "assets" RENAME COLUMN "updatedAt" TO "updated_at"`,
    )
  }
}

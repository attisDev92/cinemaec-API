import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameToCamelCase1734000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renombrar columnas de la tabla users
    const usersTableExists = await queryRunner.hasTable('users')
    if (usersTableExists) {
      const usersTable = await queryRunner.getTable('users')

      // Helper to safely rename column if it exists
      const renameIfExists = async (column: string, newName: string) => {
        if (usersTable?.findColumnByName(column)) {
          await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "${column}" TO "${newName}"`,
          )
        }
      }

      await renameIfExists('is_active', 'isActive')
      await renameIfExists('email_verification_token', 'emailVerificationToken')
      await renameIfExists('password_reset_token', 'passwordResetToken')
      await renameIfExists('password_reset_expires', 'passwordResetExpires')
      await renameIfExists('profile_id', 'profileId')
      await renameIfExists('last_login', 'lastLogin')
      await renameIfExists('created_at', 'createdAt')
    }

    // Renombrar columnas de la tabla users_profile (si existe)
    const usersProfileTableExists = await queryRunner.hasTable('users_profile')
    if (usersProfileTableExists) {
      const usersProfileTable = await queryRunner.getTable('users_profile')

      const renameIfExists = async (column: string, newName: string) => {
        if (usersProfileTable?.findColumnByName(column)) {
          await queryRunner.query(
            `ALTER TABLE "users_profile" RENAME COLUMN "${column}" TO "${newName}"`,
          )
        }
      }

      await renameIfExists('full_name', 'fullName')
      await renameIfExists('legal_name', 'legalName')
      await renameIfExists('trade_name', 'tradeName')
      await renameIfExists('legal_status', 'legalStatus')
      await renameIfExists('user_id', 'userId')
      await renameIfExists('created_at', 'createdAt')
      await renameIfExists('updated_at', 'updatedAt')
    }

    // Renombrar columnas de la tabla assets
    const assetsTableExists = await queryRunner.hasTable('assets')
    if (assetsTableExists) {
      const assetsTable = await queryRunner.getTable('assets')

      const renameIfExists = async (column: string, newName: string) => {
        if (assetsTable?.findColumnByName(column)) {
          await queryRunner.query(
            `ALTER TABLE "assets" RENAME COLUMN "${column}" TO "${newName}"`,
          )
        }
      }

      await renameIfExists('user_id', 'userId')
      await renameIfExists('document_type', 'documentType')
      await renameIfExists('owner_type', 'ownerType')
      await renameIfExists('owner_id', 'ownerId')
      await renameIfExists('firebase_path', 'firebasePath')
      await renameIfExists('created_at', 'createdAt')
      await renameIfExists('updated_at', 'updatedAt')
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir renombrado de columnas de la tabla users
    const usersTableExists = await queryRunner.hasTable('users')
    if (usersTableExists) {
      const usersTable = await queryRunner.getTable('users')

      const renameIfExists = async (column: string, newName: string) => {
        if (usersTable?.findColumnByName(column)) {
          await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "${column}" TO "${newName}"`,
          )
        }
      }

      await renameIfExists('isActive', 'is_active')
      await renameIfExists('emailVerificationToken', 'email_verification_token')
      await renameIfExists('passwordResetToken', 'password_reset_token')
      await renameIfExists('passwordResetExpires', 'password_reset_expires')
      await renameIfExists('profileId', 'profile_id')
      await renameIfExists('lastLogin', 'last_login')
      await renameIfExists('createdAt', 'created_at')
    }

    // Revertir renombrado de columnas de la tabla users_profile
    const usersProfileTableExists = await queryRunner.hasTable('users_profile')
    if (usersProfileTableExists) {
      const usersProfileTable = await queryRunner.getTable('users_profile')

      const renameIfExists = async (column: string, newName: string) => {
        if (usersProfileTable?.findColumnByName(column)) {
          await queryRunner.query(
            `ALTER TABLE "users_profile" RENAME COLUMN "${column}" TO "${newName}"`,
          )
        }
      }

      await renameIfExists('fullName', 'full_name')
      await renameIfExists('legalName', 'legal_name')
      await renameIfExists('tradeName', 'trade_name')
      await renameIfExists('legalStatus', 'legal_status')
      await renameIfExists('userId', 'user_id')
      await renameIfExists('createdAt', 'created_at')
      await renameIfExists('updatedAt', 'updated_at')
    }

    // Revertir renombrado de columnas de la tabla assets
    const assetsTableExists = await queryRunner.hasTable('assets')
    if (assetsTableExists) {
      const assetsTable = await queryRunner.getTable('assets')

      const renameIfExists = async (column: string, newName: string) => {
        if (assetsTable?.findColumnByName(column)) {
          await queryRunner.query(
            `ALTER TABLE "assets" RENAME COLUMN "${column}" TO "${newName}"`,
          )
        }
      }

      await renameIfExists('userId', 'user_id')
      await renameIfExists('documentType', 'document_type')
      await renameIfExists('ownerType', 'owner_type')
      await renameIfExists('ownerId', 'owner_id')
      await renameIfExists('firebasePath', 'firebase_path')
      await renameIfExists('createdAt', 'created_at')
      await renameIfExists('updatedAt', 'updated_at')
    }
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAgreementToProfile1735000000000 implements MigrationInterface {
  name = 'AddAgreementToProfile1735000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar el valor user_agreement al enum assets_ownertype_enum si no existe
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type t 
          JOIN pg_enum e ON t.oid = e.enumtypid 
          WHERE t.typname = 'assets_ownertype_enum' AND e.enumlabel = 'user_agreement') THEN
          ALTER TYPE assets_ownertype_enum ADD VALUE 'user_agreement';
        END IF;
      END $$;
    `)

    // Agregar columnas a la tabla users_profile
    await queryRunner.query(`
      ALTER TABLE "users_profile" 
      ADD COLUMN "agreement_document_id" integer NULL
    `)

    await queryRunner.query(`
      ALTER TABLE "users_profile" 
      ADD COLUMN "has_uploaded_agreement" boolean NOT NULL DEFAULT false
    `)

    // Agregar foreign key hacia assets
    await queryRunner.query(`
      ALTER TABLE "users_profile" 
      ADD CONSTRAINT "FK_agreement_document" 
      FOREIGN KEY ("agreement_document_id") 
      REFERENCES "assets"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    await queryRunner.query(`
      ALTER TABLE "users_profile" 
      DROP CONSTRAINT "FK_agreement_document"
    `)

    // Eliminar columnas
    await queryRunner.query(`
      ALTER TABLE "users_profile" 
      DROP COLUMN "has_uploaded_agreement"
    `)

    await queryRunner.query(`
      ALTER TABLE "users_profile" 
      DROP COLUMN "agreement_document_id"
    `)

    // Nota: No eliminamos el valor del enum porque PostgreSQL no permite eliminar valores de enums
    // Si se requiere eliminar, se debe crear un nuevo enum sin ese valor y hacer la conversión
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSeriesEpisodeFieldsToMovies1787000000000
  implements MigrationInterface
{
  name = 'AddSeriesEpisodeFieldsToMovies1787000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "movies"
      ADD COLUMN IF NOT EXISTS "episodeCount" integer
    `)

    await queryRunner.query(`
      ALTER TABLE "movies"
      ADD COLUMN IF NOT EXISTS "seasonCount" integer
    `)

    await queryRunner.query(`
      ALTER TABLE "movies"
      ADD COLUMN IF NOT EXISTS "episodeDurationMinutes" integer
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "movies"
      DROP COLUMN IF EXISTS "episodeDurationMinutes"
    `)

    await queryRunner.query(`
      ALTER TABLE "movies"
      DROP COLUMN IF EXISTS "seasonCount"
    `)

    await queryRunner.query(`
      ALTER TABLE "movies"
      DROP COLUMN IF EXISTS "episodeCount"
    `)
  }
}

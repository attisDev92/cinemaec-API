import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddResolvedToSpaceReviews1736000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('space_reviews', [
      new TableColumn({
        name: 'resolved',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
      new TableColumn({
        name: 'resolvedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('space_reviews', 'resolvedAt')
    await queryRunner.dropColumn('space_reviews', 'resolved')
  }
}

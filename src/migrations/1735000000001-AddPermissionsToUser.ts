import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddPermissionsToUser1735000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'permissions',
        type: 'text',
        isArray: true,
        isNullable: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'permissions')
  }
}

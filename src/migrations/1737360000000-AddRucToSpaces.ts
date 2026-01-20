import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddRucToSpaces1737360000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna ruc ya existe
    const table = await queryRunner.getTable('spaces')

    if (table && !table.findColumnByName('ruc')) {
      // Agregar columna ruc como nullable para no afectar datos existentes
      await queryRunner.addColumn(
        'spaces',
        new TableColumn({
          name: 'ruc',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna ruc en caso de rollback
    const table = await queryRunner.getTable('spaces')

    if (table && table.findColumnByName('ruc')) {
      await queryRunner.dropColumn('spaces', 'ruc')
    }
  }
}

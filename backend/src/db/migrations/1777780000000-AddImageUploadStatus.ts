import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImageUploadStatus1777780000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists before adding
    const hasColumn = await queryRunner.hasColumn('products', 'imageUploadStatus');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'imageUploadStatus',
          type: 'varchar',
          default: "'completed'",
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('products', 'imageUploadStatus');
    if (hasColumn) {
      await queryRunner.dropColumn('products', 'imageUploadStatus');
    }
  }
}

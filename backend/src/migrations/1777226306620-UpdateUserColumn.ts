import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserColumn1777226306620 implements MigrationInterface {
    name = 'UpdateUserColumn1777226306620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
    }

}

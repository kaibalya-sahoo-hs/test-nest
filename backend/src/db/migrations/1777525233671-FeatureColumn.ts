import { MigrationInterface, QueryRunner } from "typeorm";

export class FeatureColumn1777525233671 implements MigrationInterface {
    name = 'FeatureColumn1777525233671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "features" text array`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "features"`);
    }

}

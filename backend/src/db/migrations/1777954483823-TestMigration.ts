import { MigrationInterface, QueryRunner } from "typeorm";

export class TestMigration1777954483823 implements MigrationInterface {
    name = 'TestMigration1777954483823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "random" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "random"`);
    }

}

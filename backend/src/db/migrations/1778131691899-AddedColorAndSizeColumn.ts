import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColorAndSizeColumn1778131691899 implements MigrationInterface {
    name = 'AddedColorAndSizeColumn1778131691899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "sku"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "attribute"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "color" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "size" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "attribute" text`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "attribute"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "color"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "attribute" text`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "sku" character varying`);
    }

}

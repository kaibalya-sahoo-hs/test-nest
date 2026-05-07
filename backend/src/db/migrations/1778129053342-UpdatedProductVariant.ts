import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedProductVariant1778129053342 implements MigrationInterface {
    name = 'UpdatedProductVariant1778129053342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "color"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUploadStatus"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "sku" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "attribute" text`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "attribute"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "sku"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "imageUploadStatus" character varying NOT NULL DEFAULT 'completed'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "images" text DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "size" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "color" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "name" character varying`);
    }

}

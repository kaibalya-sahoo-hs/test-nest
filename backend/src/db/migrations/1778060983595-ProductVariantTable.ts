import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductVariantTable1778060983595 implements MigrationInterface {
    name = 'ProductVariantTable1778060983595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "price" numeric(10,2), "color" character varying NOT NULL, "size" character varying NOT NULL, "stock" integer, "image" character varying, "images" text DEFAULT '[]', "imageUploadStatus" character varying NOT NULL DEFAULT 'completed', "productId" uuid, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUploadStatus"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "images" text DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "imageUploadStatus" character varying NOT NULL DEFAULT 'completed'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUploadStatus"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "imageUploadStatus" character varying NOT NULL DEFAULT 'completed'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "images" text DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
    }

}

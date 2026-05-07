import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductAndCartItemTable1778151872605 implements MigrationInterface {
    name = 'UpdateProductAndCartItemTable1778151872605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "attribute"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "variantId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "attribute" text`);
    }

}

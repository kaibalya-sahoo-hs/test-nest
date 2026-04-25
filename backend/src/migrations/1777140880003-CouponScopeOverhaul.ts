import { MigrationInterface, QueryRunner } from "typeorm";

export class CouponScopeOverhaul1777140880003 implements MigrationInterface {
    name = 'CouponScopeOverhaul1777140880003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupons" DROP CONSTRAINT "FK_315a05b8b3f7461efa50e49fb4b"`);
        await queryRunner.query(`CREATE TABLE "coupon_products" ("couponsId" integer NOT NULL, "productsId" uuid NOT NULL, CONSTRAINT "PK_6f96daddf80851582be7fa08b46" PRIMARY KEY ("couponsId", "productsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c05afaad3161a29c5c0cce9664" ON "coupon_products" ("couponsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_70a38d5642ce21bfa125db0dea" ON "coupon_products" ("productsId") `);
        await queryRunner.query(`ALTER TABLE "coupons" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD "minimumAmount" integer`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD "maxDiscountAmount" integer`);
        await queryRunner.query(`CREATE TYPE "public"."coupons_scope_enum" AS ENUM('global', 'vendor', 'product')`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD "scope" "public"."coupons_scope_enum" NOT NULL DEFAULT 'product'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT '0.1'`);
        await queryRunner.query(`ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_c05afaad3161a29c5c0cce96648" FOREIGN KEY ("couponsId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_70a38d5642ce21bfa125db0dea4" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_70a38d5642ce21bfa125db0dea4"`);
        await queryRunner.query(`ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_c05afaad3161a29c5c0cce96648"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "commisionRate" SET DEFAULT 0.1`);
        await queryRunner.query(`ALTER TABLE "coupons" DROP COLUMN "scope"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_scope_enum"`);
        await queryRunner.query(`ALTER TABLE "coupons" DROP COLUMN "maxDiscountAmount"`);
        await queryRunner.query(`ALTER TABLE "coupons" DROP COLUMN "minimumAmount"`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD "productId" uuid`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70a38d5642ce21bfa125db0dea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c05afaad3161a29c5c0cce9664"`);
        await queryRunner.query(`DROP TABLE "coupon_products"`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD CONSTRAINT "FK_315a05b8b3f7461efa50e49fb4b" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

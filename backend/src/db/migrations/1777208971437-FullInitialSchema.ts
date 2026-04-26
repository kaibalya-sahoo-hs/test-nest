import { MigrationInterface, QueryRunner } from "typeorm";

export class FullInitialSchema1777208971437 implements MigrationInterface {
    name = 'FullInitialSchema1777208971437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."addresses_addresstype_enum" AS ENUM('home', 'work', 'other')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "registartionToken" character varying, "profile" character varying, "role" character varying NOT NULL DEFAULT 'guest', "balance" integer NOT NULL DEFAULT '0', "storeName" character varying, "storeDescription" character varying, "vendorStatus" character varying DEFAULT 'pending', "commisionRate" numeric DEFAULT '0.1', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "streetAddress" character varying NOT NULL, "landmark" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "postalCode" character varying NOT NULL, "country" character varying NOT NULL DEFAULT 'India', "isDefault" boolean NOT NULL DEFAULT false, "addressType" "public"."addresses_addresstype_enum" NOT NULL DEFAULT 'home', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coupons_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TYPE "public"."coupons_creatortype_enum" AS ENUM('platform', 'vendor')`);
        await queryRunner.query(`CREATE TYPE "public"."coupons_scope_enum" AS ENUM('global', 'vendor', 'product')`);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "displayName" character varying NOT NULL, "description" character varying NOT NULL, "discountValue" numeric(10,2) NOT NULL, "type" "public"."coupons_type_enum" NOT NULL DEFAULT 'percentage', "expiryDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "usageCount" integer NOT NULL DEFAULT '0', "usageLimit" integer, "minimumAmount" integer, "maxDiscountAmount" integer, "creatorType" "public"."coupons_creatortype_enum" NOT NULL DEFAULT 'platform', "scope" "public"."coupons_scope_enum" NOT NULL DEFAULT 'product', "vendorId" integer, CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "rating" double precision NOT NULL DEFAULT '0', "image" character varying, "images" text DEFAULT '[]', "stock" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "category" character varying, "vendorId" integer, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" uuid, "productId" uuid, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" integer NOT NULL DEFAULT '0', "discountedAmount" numeric NOT NULL DEFAULT '0', "discount" numeric NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'active', "userId" integer, "couponId" integer, CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        
        await queryRunner.query(`CREATE TABLE "withdraws" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "remainingBalance" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "transactionId" character varying, "payoutId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_f4fdb46314be0e41de7da92f63c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "registartionToken" character varying, "profile" character varying, "storeName" character varying, "storeDescription" character varying, "vendorStatus" character varying, "commisionRate" numeric, "balance" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vendor_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "winthdrawAmount" numeric NOT NULL, "remainingBalance" numeric NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_8f819c1051cde2929df249f35c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" numeric(10,2) NOT NULL, "items" json NOT NULL, "status" character varying NOT NULL DEFAULT 'awaiting_payment', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "couponCode" character varying, "discount" numeric NOT NULL DEFAULT '0', "couponType" character varying, "parentOrderId" uuid, "userId" integer, "deliveryAddressId" uuid, "vendorId" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "razorpayOrderId" character varying NOT NULL, "razorpayPaymentId" character varying, "razorpaySignature" character varying, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'INR', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment-logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "paymentStatus" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "paymentId" uuid, CONSTRAINT "PK_ea25e6b1a974a861ac5b566e4f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "member" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "designation" character varying NOT NULL, CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "api_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL, "url" character varying NOT NULL, "statusCode" integer, "payload" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b75b6c8fef7ba758dfef840942d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coupon_products" ("couponsId" integer NOT NULL, "productsId" uuid NOT NULL, CONSTRAINT "PK_6f96daddf80851582be7fa08b46" PRIMARY KEY ("couponsId", "productsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c05afaad3161a29c5c0cce9664" ON "coupon_products" ("couponsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_70a38d5642ce21bfa125db0dea" ON "coupon_products" ("productsId") `);
        await queryRunner.query(`CREATE TABLE "product_tags" ("productsId" uuid NOT NULL, "tagsId" uuid NOT NULL, CONSTRAINT "PK_dc16d9688b488ced155b25305a6" PRIMARY KEY ("productsId", "tagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_839f9df6d05c84374a1174ac46" ON "product_tags" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d795417dd4950b15042a53fe9" ON "product_tags" ("tagsId") `);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD CONSTRAINT "FK_f204fd3f2e1f0ea4772d6138776" FOREIGN KEY ("vendorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_6b00af9e9c38a1673f594de74f4" FOREIGN KEY ("vendorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_b587940e6e9cfec985552e6709b" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "withdraws" ADD CONSTRAINT "FK_0a28dae4c0f85c62c21f906f904" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_30ee8a2cdaec1bf453319da0906" FOREIGN KEY ("parentOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_749e5d7152b6cde429099a99530" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_4fc5a9360e2b4e795f02344ae75" FOREIGN KEY ("vendorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment-logs" ADD CONSTRAINT "FK_8e8ac3410fecaaf1cfcb22f8f74" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_c05afaad3161a29c5c0cce96648" FOREIGN KEY ("couponsId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coupon_products" ADD CONSTRAINT "FK_70a38d5642ce21bfa125db0dea4" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_839f9df6d05c84374a1174ac466" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_4d795417dd4950b15042a53fe9c" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_4d795417dd4950b15042a53fe9c"`);
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_839f9df6d05c84374a1174ac466"`);
        await queryRunner.query(`ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_70a38d5642ce21bfa125db0dea4"`);
        await queryRunner.query(`ALTER TABLE "coupon_products" DROP CONSTRAINT "FK_c05afaad3161a29c5c0cce96648"`);
        await queryRunner.query(`ALTER TABLE "payment-logs" DROP CONSTRAINT "FK_8e8ac3410fecaaf1cfcb22f8f74"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_4fc5a9360e2b4e795f02344ae75"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_749e5d7152b6cde429099a99530"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_30ee8a2cdaec1bf453319da0906"`);
        await queryRunner.query(`ALTER TABLE "withdraws" DROP CONSTRAINT "FK_0a28dae4c0f85c62c21f906f904"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_b587940e6e9cfec985552e6709b"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_756f53ab9466eb52a52619ee019"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_6b00af9e9c38a1673f594de74f4"`);
        await queryRunner.query(`ALTER TABLE "coupons" DROP CONSTRAINT "FK_f204fd3f2e1f0ea4772d6138776"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d795417dd4950b15042a53fe9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_839f9df6d05c84374a1174ac46"`);
        await queryRunner.query(`DROP TABLE "product_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70a38d5642ce21bfa125db0dea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c05afaad3161a29c5c0cce9664"`);
        await queryRunner.query(`DROP TABLE "coupon_products"`);
        await queryRunner.query(`DROP TABLE "api_log"`);
        await queryRunner.query(`DROP TABLE "member"`);
        await queryRunner.query(`DROP TABLE "payment-logs"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "vendor_transaction"`);
        await queryRunner.query(`DROP TABLE "vendor"`);
        await queryRunner.query(`DROP TABLE "withdraws"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_scope_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_creatortype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_type_enum"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TYPE "public"."addresses_addresstype_enum"`);
    }

}

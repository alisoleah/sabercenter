-- AlterTable: Add images and description columns to products table
ALTER TABLE "products" ADD COLUMN "images" JSONB;
ALTER TABLE "products" ADD COLUMN "description" TEXT;
ALTER TABLE "products" ALTER COLUMN "stock_qty" SET DEFAULT 50;

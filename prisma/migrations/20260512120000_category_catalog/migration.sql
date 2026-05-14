-- CreateEnum
CREATE TYPE "Catalog" AS ENUM ('BAKERY', 'RESTAURANT');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN "catalog" "Catalog" NOT NULL DEFAULT 'BAKERY';

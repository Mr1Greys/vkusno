-- AlterTable
ALTER TABLE "Product" ADD COLUMN "stockQuantity" INTEGER;

-- AlterTable
ALTER TABLE "BonusHistory" ADD COLUMN "createdByUserId" TEXT;

-- AddForeignKey (orderId existed without FK)
ALTER TABLE "BonusHistory" ADD CONSTRAINT "BonusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusHistory" ADD CONSTRAINT "BonusHistory_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

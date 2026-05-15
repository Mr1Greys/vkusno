-- Удаляем неиспользуемый тип REFERRAL из enum BonusType
DELETE FROM "BonusHistory" WHERE type = 'REFERRAL';

ALTER TYPE "BonusType" RENAME TO "BonusType_old";

CREATE TYPE "BonusType" AS ENUM ('EARNED', 'SPENT', 'MANUAL');

ALTER TABLE "BonusHistory"
  ALTER COLUMN "type" TYPE "BonusType"
  USING ("type"::text::"BonusType");

DROP TYPE "BonusType_old";

ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT;

UPDATE "User"
SET "passwordHash" = 'TEMP_PASSWORD_HASH'
WHERE "passwordHash" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "passwordHash" SET NOT NULL;
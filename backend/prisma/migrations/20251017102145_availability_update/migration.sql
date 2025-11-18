/*
  Warnings:

  - The values [CAN_BE_IN,ON_ORDER] on the enum `Availability` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Availability_new" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE');
ALTER TABLE "public"."Product" ALTER COLUMN "availability" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "availability" TYPE "Availability_new" USING ("availability"::text::"Availability_new");
ALTER TYPE "Availability" RENAME TO "Availability_old";
ALTER TYPE "Availability_new" RENAME TO "Availability";
DROP TYPE "public"."Availability_old";
ALTER TABLE "Product" ALTER COLUMN "availability" SET DEFAULT 'AVAILABLE';
COMMIT;

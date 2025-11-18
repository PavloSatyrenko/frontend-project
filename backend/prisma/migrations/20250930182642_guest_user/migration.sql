-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "passwordHash" DROP NOT NULL;

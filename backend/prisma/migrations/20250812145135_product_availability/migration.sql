-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('AVAILABLE', 'CAN_BE_IN', 'NOT_AVAILABLE', 'ON_ORDER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availability" "Availability" NOT NULL DEFAULT 'AVAILABLE';

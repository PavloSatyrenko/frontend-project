/*
  Warnings:

  - You are about to drop the column `Invoice` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "Invoice",
ADD COLUMN     "invoice" TEXT;

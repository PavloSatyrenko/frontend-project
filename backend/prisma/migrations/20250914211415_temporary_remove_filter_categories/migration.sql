/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the `_FilterValueToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Filter" DROP CONSTRAINT "Filter_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FilterValueToProduct" DROP CONSTRAINT "_FilterValueToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FilterValueToProduct" DROP CONSTRAINT "_FilterValueToProduct_B_fkey";

-- AlterTable
ALTER TABLE "public"."Filter" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "public"."_FilterValueToProduct";

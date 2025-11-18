/*
  Warnings:

  - A unique constraint covering the columns `[csvId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `csvId` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "csvId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_csvId_key" ON "Category"("csvId");

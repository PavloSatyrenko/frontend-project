/*
  Warnings:

  - You are about to drop the column `productsPrice` on the `Order` table. All the data in the column will be lost.
  - Added the required column `productsPriceIn` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productsPriceOut` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productsPriceOutBasic` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productsPrice",
ADD COLUMN     "productsPriceIn" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "productsPriceOut" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "productsPriceOutBasic" DOUBLE PRECISION NOT NULL;

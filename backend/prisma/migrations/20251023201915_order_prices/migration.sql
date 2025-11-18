/*
  Warnings:

  - You are about to drop the column `productsPriceIn` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productsPriceOut` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productsPriceOutBasic` on the `Order` table. All the data in the column will be lost.
  - Added the required column `productsPrice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceOut` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceOutBasic` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productsPriceIn",
DROP COLUMN "productsPriceOut",
DROP COLUMN "productsPriceOutBasic",
ADD COLUMN     "productsPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "priceOut" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "priceOutBasic" DOUBLE PRECISION NOT NULL;

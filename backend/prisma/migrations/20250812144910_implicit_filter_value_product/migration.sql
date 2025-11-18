/*
  Warnings:

  - You are about to drop the `FilterValueProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FilterValueProduct" DROP CONSTRAINT "FilterValueProduct_filterId_fkey";

-- DropForeignKey
ALTER TABLE "FilterValueProduct" DROP CONSTRAINT "FilterValueProduct_productId_fkey";

-- DropTable
DROP TABLE "FilterValueProduct";

-- CreateTable
CREATE TABLE "_FilterValueToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FilterValueToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FilterValueToProduct_B_index" ON "_FilterValueToProduct"("B");

-- AddForeignKey
ALTER TABLE "_FilterValueToProduct" ADD CONSTRAINT "_FilterValueToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "FilterValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FilterValueToProduct" ADD CONSTRAINT "_FilterValueToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[code,manufacturer,supplier]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_code_manufacturer_supplier_key" ON "Product"("code", "manufacturer", "supplier");

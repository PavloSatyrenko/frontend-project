-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "Product_code_idx" ON "public"."Product"("code");

-- CreateIndex
CREATE INDEX "Product_manufacturer_idx" ON "public"."Product"("manufacturer");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "public"."Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "public"."Product"("price");

-- CreateIndex
CREATE INDEX "Product_discount_idx" ON "public"."Product"("discount");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "public"."Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_name_manufacturer_idx" ON "public"."Product"("name", "manufacturer");

-- CreateIndex
CREATE INDEX "Product_categoryId_price_idx" ON "public"."Product"("categoryId", "price");

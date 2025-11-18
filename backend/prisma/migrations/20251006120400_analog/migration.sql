-- CreateTable
CREATE TABLE "Analog" (
    "productId" TEXT NOT NULL,
    "analogProductId" TEXT NOT NULL,

    CONSTRAINT "Analog_pkey" PRIMARY KEY ("productId","analogProductId")
);

-- AddForeignKey
ALTER TABLE "Analog" ADD CONSTRAINT "Analog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analog" ADD CONSTRAINT "Analog_analogProductId_fkey" FOREIGN KEY ("analogProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

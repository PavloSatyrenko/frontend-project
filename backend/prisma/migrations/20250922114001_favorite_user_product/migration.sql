/*
  Warnings:

  - You are about to drop the `UserProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserProduct" DROP CONSTRAINT "UserProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProduct" DROP CONSTRAINT "UserProduct_userId_fkey";

-- DropTable
DROP TABLE "public"."UserProduct";

-- CreateTable
CREATE TABLE "public"."FavoriteUserProduct" (
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "FavoriteUserProduct_pkey" PRIMARY KEY ("userId","productId")
);

-- AddForeignKey
ALTER TABLE "public"."FavoriteUserProduct" ADD CONSTRAINT "FavoriteUserProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteUserProduct" ADD CONSTRAINT "FavoriteUserProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

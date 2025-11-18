-- CreateTable
CREATE TABLE "Filter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilterValue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filterId" TEXT NOT NULL,

    CONSTRAINT "FilterValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FilterValue" ADD CONSTRAINT "FilterValue_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "Filter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

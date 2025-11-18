-- Drop existing enum (if not used by constraints)
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;
DROP TYPE "OrderStatus";

-- Recreate enum
CREATE TYPE "OrderStatus" AS ENUM ('ACCEPTED', 'PROCESSING', 'PREPARING', 'SENT', 'COMPLETED', 'CANCELLED');

-- Reassign type
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'ACCEPTED';

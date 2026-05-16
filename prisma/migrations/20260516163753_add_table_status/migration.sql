-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('FREE', 'OCCUPIED', 'RESERVED');

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "status" "TableStatus" NOT NULL DEFAULT 'FREE';

-- CreateIndex
CREATE INDEX "tables_tenant_id_status_idx" ON "tables"("tenant_id", "status");

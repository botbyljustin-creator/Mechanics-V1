/*
  Warnings:

  - You are about to drop the column `includes` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `outputs` on the `Department` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MetricSection" AS ENUM ('INCLUDE', 'OUTPUT');

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "includes",
DROP COLUMN "outputs";

-- CreateTable
CREATE TABLE "MetricItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "section" "MetricSection" NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '%',
    "higherBetter" BOOLEAN NOT NULL DEFAULT true,
    "target" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricItemHistory" (
    "id" TEXT NOT NULL,
    "metricItemId" TEXT NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "actual" DOUBLE PRECISION NOT NULL,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricItemHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetricItem_departmentId_section_key_key" ON "MetricItem"("departmentId", "section", "key");

-- CreateIndex
CREATE INDEX "MetricItemHistory_metricItemId_idx" ON "MetricItemHistory"("metricItemId");

-- AddForeignKey
ALTER TABLE "MetricItem" ADD CONSTRAINT "MetricItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricItemHistory" ADD CONSTRAINT "MetricItemHistory_metricItemId_fkey" FOREIGN KEY ("metricItemId") REFERENCES "MetricItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

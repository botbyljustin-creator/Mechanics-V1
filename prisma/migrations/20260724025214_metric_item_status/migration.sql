-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('GAUGE', 'STATUS');

-- CreateEnum
CREATE TYPE "StatusLevel" AS ENUM ('GOOD', 'WATCH', 'RISK');

-- AlterTable
ALTER TABLE "MetricItem" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "StatusLevel" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "type" "MetricType" NOT NULL DEFAULT 'GAUGE';

-- AlterTable
ALTER TABLE "MetricItemHistory" ADD COLUMN     "note" TEXT,
ADD COLUMN     "status" "StatusLevel",
ADD COLUMN     "type" "MetricType" NOT NULL DEFAULT 'GAUGE',
ALTER COLUMN "target" DROP NOT NULL,
ALTER COLUMN "actual" DROP NOT NULL;

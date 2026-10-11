-- CreateTable
CREATE TABLE "SpillReport" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SpillReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpillReport_locationId_resolved_idx" ON "SpillReport"("locationId", "resolved");

-- AddForeignKey
ALTER TABLE "SpillReport" ADD CONSTRAINT "SpillReport_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpillReport" ADD CONSTRAINT "SpillReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpillReport" ADD CONSTRAINT "SpillReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

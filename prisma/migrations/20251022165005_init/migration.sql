-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "seatCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'out',
    "location" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faceId" TEXT,
    "department" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_seatCode_key" ON "Staff"("seatCode");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_faceId_key" ON "Staff"("faceId");

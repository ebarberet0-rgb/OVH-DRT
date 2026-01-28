-- CreateTable
CREATE TABLE "EventInstructor" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInstructor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventInstructor_eventId_idx" ON "EventInstructor"("eventId");

-- CreateIndex
CREATE INDEX "EventInstructor_instructorId_idx" ON "EventInstructor"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInstructor_eventId_instructorId_key" ON "EventInstructor"("eventId", "instructorId");

-- AddForeignKey
ALTER TABLE "EventInstructor" ADD CONSTRAINT "EventInstructor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInstructor" ADD CONSTRAINT "EventInstructor_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

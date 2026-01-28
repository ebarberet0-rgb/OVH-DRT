-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DEALER', 'INSTRUCTOR', 'CLIENT');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('A', 'A2', 'A1');

-- CreateEnum
CREATE TYPE "MotorcycleGroup" AS ENUM ('GROUP_1', 'GROUP_2');

-- CreateEnum
CREATE TYPE "MotorcycleStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'DAMAGED', 'UNDER_REPAIR');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('DEALERSHIP', 'PUBLIC_EVENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('RESERVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('WEBSITE', 'TABLET', 'DEALER_SITE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "postalCode" TEXT,
    "city" TEXT,
    "currentBrand" TEXT,
    "currentModel" TEXT,
    "licenseType" "LicenseType",
    "licenseNumber" TEXT,
    "licenseIssueDate" TIMESTAMP(3),
    "licenseExpiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dealer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "winteamUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motorcycle" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "bikeNumber" INTEGER NOT NULL,
    "group" "MotorcycleGroup" NOT NULL,
    "status" "MotorcycleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "imageUrl" TEXT NOT NULL,
    "requiredLicense" "LicenseType" NOT NULL,
    "isYAMT" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motorcycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotorcycleDamage" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedRepairDate" TIMESTAMP(3),
    "repairedAt" TIMESTAMP(3),

    CONSTRAINT "MotorcycleDamage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotorcycleAvailability" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MotorcycleAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "dealerId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "maxSlotsPerSession" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "group" "MotorcycleGroup" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "availableSlots" INTEGER NOT NULL DEFAULT 7,
    "bookedSlots" INTEGER NOT NULL DEFAULT 0,
    "instructorId" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'RESERVED',
    "source" "BookingSource" NOT NULL,
    "hasSignedWaiver" BOOLEAN NOT NULL DEFAULT false,
    "hasPhotoConsent" BOOLEAN NOT NULL DEFAULT false,
    "licensePhotoFrontUrl" TEXT,
    "licensePhotoBackUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSatisfactionForm" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "motorcycleRating" INTEGER NOT NULL,
    "instructorRating" INTEGER NOT NULL,
    "organizationRating" INTEGER NOT NULL,
    "purchaseIntent" TEXT NOT NULL,
    "purchaseTimeframe" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientSatisfactionForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerSatisfactionForm" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "organizationRating" INTEGER NOT NULL,
    "teamRating" INTEGER NOT NULL,
    "animationsDescription" TEXT NOT NULL,
    "promotionsOffered" TEXT NOT NULL,
    "salesCount" INTEGER NOT NULL,
    "wouldParticipateAgain" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealerSatisfactionForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DRTTeamReport" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "leadTreatmentScore" DOUBLE PRECISION NOT NULL,
    "animationScore" DOUBLE PRECISION NOT NULL,
    "teamEngagementScore" DOUBLE PRECISION NOT NULL,
    "communicationScore" DOUBLE PRECISION NOT NULL,
    "clientSatisfactionScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "photoUrls" TEXT[],
    "dealerInvestmentNotes" TEXT NOT NULL,
    "animationNotes" TEXT NOT NULL,
    "salesNotes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DRTTeamReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "templateId" TEXT,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteAnalytics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT,
    "campaign" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "landingPage" TEXT NOT NULL,
    "exitPage" TEXT,
    "pagesVisited" INTEGER NOT NULL DEFAULT 1,
    "timeSpent" INTEGER,
    "hasBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_email_key" ON "Dealer"("email");

-- CreateIndex
CREATE INDEX "Dealer_city_idx" ON "Dealer"("city");

-- CreateIndex
CREATE INDEX "Dealer_region_idx" ON "Dealer"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Motorcycle_plateNumber_key" ON "Motorcycle"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Motorcycle_bikeNumber_key" ON "Motorcycle"("bikeNumber");

-- CreateIndex
CREATE INDEX "Motorcycle_status_idx" ON "Motorcycle"("status");

-- CreateIndex
CREATE INDEX "Motorcycle_group_idx" ON "Motorcycle"("group");

-- CreateIndex
CREATE INDEX "MotorcycleDamage_motorcycleId_idx" ON "MotorcycleDamage"("motorcycleId");

-- CreateIndex
CREATE INDEX "MotorcycleDamage_reportedAt_idx" ON "MotorcycleDamage"("reportedAt");

-- CreateIndex
CREATE INDEX "MotorcycleAvailability_eventId_idx" ON "MotorcycleAvailability"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "MotorcycleAvailability_motorcycleId_eventId_key" ON "MotorcycleAvailability"("motorcycleId", "eventId");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_city_idx" ON "Event"("city");

-- CreateIndex
CREATE INDEX "Event_dealerId_idx" ON "Event"("dealerId");

-- CreateIndex
CREATE INDEX "Session_eventId_idx" ON "Session"("eventId");

-- CreateIndex
CREATE INDEX "Session_startTime_idx" ON "Session"("startTime");

-- CreateIndex
CREATE INDEX "Session_group_idx" ON "Session"("group");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_eventId_idx" ON "Booking"("eventId");

-- CreateIndex
CREATE INDEX "Booking_sessionId_idx" ON "Booking"("sessionId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSatisfactionForm_bookingId_key" ON "ClientSatisfactionForm"("bookingId");

-- CreateIndex
CREATE INDEX "ClientSatisfactionForm_eventId_idx" ON "ClientSatisfactionForm"("eventId");

-- CreateIndex
CREATE INDEX "ClientSatisfactionForm_userId_idx" ON "ClientSatisfactionForm"("userId");

-- CreateIndex
CREATE INDEX "DealerSatisfactionForm_eventId_idx" ON "DealerSatisfactionForm"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerSatisfactionForm_eventId_dealerId_key" ON "DealerSatisfactionForm"("eventId", "dealerId");

-- CreateIndex
CREATE INDEX "DRTTeamReport_eventId_idx" ON "DRTTeamReport"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "DRTTeamReport_eventId_key" ON "DRTTeamReport"("eventId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "WebsiteAnalytics_createdAt_idx" ON "WebsiteAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "WebsiteAnalytics_source_idx" ON "WebsiteAnalytics"("source");

-- CreateIndex
CREATE INDEX "WebsiteAnalytics_hasBooked_idx" ON "WebsiteAnalytics"("hasBooked");

-- AddForeignKey
ALTER TABLE "MotorcycleDamage" ADD CONSTRAINT "MotorcycleDamage_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotorcycleAvailability" ADD CONSTRAINT "MotorcycleAvailability_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotorcycleAvailability" ADD CONSTRAINT "MotorcycleAvailability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSatisfactionForm" ADD CONSTRAINT "ClientSatisfactionForm_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSatisfactionForm" ADD CONSTRAINT "ClientSatisfactionForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSatisfactionForm" ADD CONSTRAINT "ClientSatisfactionForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerSatisfactionForm" ADD CONSTRAINT "DealerSatisfactionForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerSatisfactionForm" ADD CONSTRAINT "DealerSatisfactionForm_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DRTTeamReport" ADD CONSTRAINT "DRTTeamReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DRTTeamReport" ADD CONSTRAINT "DRTTeamReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

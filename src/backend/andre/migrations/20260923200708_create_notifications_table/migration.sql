-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('resident', 'manager');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'denied');

-- CreateEnum
CREATE TYPE "ParkingSpotType" AS ENUM ('compact', 'standard', 'suv', 'motorcycle');

-- CreateTable
CREATE TABLE "vagaLivreCondominiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "vagaLivreCondominiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagaLivreRegisteredUsers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL,
    "registrationDate" TEXT,
    "avatarUrl" TEXT,
    "dateOfBirth" TEXT,
    "apartment" TEXT,
    "cpf" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "condominiumId" TEXT,

    CONSTRAINT "vagaLivreRegisteredUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagaLivreAuth" (
    "id" TEXT NOT NULL DEFAULT 'current',
    "isAuthenticated" BOOLEAN NOT NULL,
    "user" JSONB,

    CONSTRAINT "vagaLivreAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagaLivreParkingSpots" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "ParkingSpotType" NOT NULL,
    "location" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT,
    "ownerName" TEXT,
    "currentReservationId" TEXT,
    "description" TEXT,
    "availability" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "vagaLivreParkingSpots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagaLivreReservations" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ NOT NULL,
    "vehiclePlate" TEXT,

    CONSTRAINT "vagaLivreReservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vagaLivreRegisteredUsers_email_key" ON "vagaLivreRegisteredUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vagaLivreParkingSpots_currentReservationId_key" ON "vagaLivreParkingSpots"("currentReservationId");

-- AddForeignKey
ALTER TABLE "vagaLivreRegisteredUsers" ADD CONSTRAINT "vagaLivreRegisteredUsers_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "vagaLivreCondominiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagaLivreParkingSpots" ADD CONSTRAINT "vagaLivreParkingSpots_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "vagaLivreRegisteredUsers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagaLivreParkingSpots" ADD CONSTRAINT "vagaLivreParkingSpots_currentReservationId_fkey" FOREIGN KEY ("currentReservationId") REFERENCES "vagaLivreReservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagaLivreReservations" ADD CONSTRAINT "vagaLivreReservations_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "vagaLivreParkingSpots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagaLivreReservations" ADD CONSTRAINT "vagaLivreReservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "vagaLivreRegisteredUsers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

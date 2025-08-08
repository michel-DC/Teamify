/*
  Warnings:

  - A unique constraint covering the columns `[eventCode]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventCode` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventCode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EventByCode" (
    "id" SERIAL NOT NULL,
    "eventCode" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventByCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventByCode_eventCode_key" ON "EventByCode"("eventCode");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventCode_key" ON "Event"("eventCode");

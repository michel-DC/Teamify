/*
  Warnings:

  - You are about to drop the column `email` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `userUid` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventCode,receiverEmail]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventCode` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverEmail` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverName` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_userUid_fkey";

-- DropIndex
DROP INDEX "Invitation_eventId_email_key";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "email",
DROP COLUMN "eventId",
DROP COLUMN "userUid",
ADD COLUMN     "eventCode" TEXT NOT NULL,
ADD COLUMN     "receiverEmail" TEXT NOT NULL,
ADD COLUMN     "receiverName" TEXT NOT NULL,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_eventCode_receiverEmail_key" ON "Invitation"("eventCode", "receiverEmail");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_eventCode_fkey" FOREIGN KEY ("eventCode") REFERENCES "Event"("eventCode") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[invitationId]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Invitation" ADD COLUMN     "invitationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_invitationId_key" ON "public"."Invitation"("invitationId");

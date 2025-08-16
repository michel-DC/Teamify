/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "members" JSONB DEFAULT '[]',
ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "PreparationTodo" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_publicId_key" ON "Organization"("publicId");

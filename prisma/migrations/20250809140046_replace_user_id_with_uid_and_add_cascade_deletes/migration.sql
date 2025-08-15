/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `EventByCode` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Organization` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserByRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `UserByRole` table. All the data in the column will be lost.
  - Added the required column `ownerUid` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerUid` to the `EventByCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventByCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userUid` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerUid` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PreparationTodo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PreparationTodoGroup` table without a default value. This is not possible if the table is not empty.
  - The required column `uid` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserByRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userUid` to the `UserByRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PreparationTodo" DROP CONSTRAINT "PreparationTodo_eventId_fkey";

-- DropForeignKey
ALTER TABLE "PreparationTodo" DROP CONSTRAINT "PreparationTodo_groupId_fkey";

-- DropForeignKey
ALTER TABLE "PreparationTodoGroup" DROP CONSTRAINT "PreparationTodoGroup_eventId_fkey";

-- DropForeignKey
ALTER TABLE "UserByRole" DROP CONSTRAINT "UserByRole_userId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "ownerId",
ADD COLUMN     "ownerUid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventByCode" DROP COLUMN "ownerId",
ADD COLUMN     "ownerUid" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "userId",
ADD COLUMN     "userUid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "ownerId",
ADD COLUMN     "ownerUid" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PreparationTodo" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PreparationTodoGroup" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "uid" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("uid");

-- AlterTable
ALTER TABLE "UserByRole" DROP CONSTRAINT "UserByRole_pkey",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userUid" TEXT NOT NULL,
ADD CONSTRAINT "UserByRole_pkey" PRIMARY KEY ("userUid");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerUid_fkey" FOREIGN KEY ("ownerUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerUid_fkey" FOREIGN KEY ("ownerUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodoGroup" ADD CONSTRAINT "PreparationTodoGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodo" ADD CONSTRAINT "PreparationTodo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodo" ADD CONSTRAINT "PreparationTodo_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PreparationTodoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserByRole" ADD CONSTRAINT "UserByRole_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

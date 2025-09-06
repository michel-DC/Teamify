-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "OrgInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('ASSOCIATION', 'PME', 'ENTREPRISE', 'STARTUP', 'AUTO_ENTREPRENEUR');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('A_VENIR', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('REUNION', 'SEMINAIRE', 'CONFERENCE', 'FORMATION', 'ATELIER', 'NETWORKING', 'CEREMONIE', 'EXPOSITION', 'CONCERT', 'SPECTACLE', 'AUTRE');

-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationCount" INTEGER NOT NULL DEFAULT 0,
    "uid" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileImage" TEXT,
    "googleId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "memberCount" INTEGER NOT NULL,
    "mission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerUid" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "location" JSONB,
    "organizationType" "OrganizationType" NOT NULL,
    "members" JSONB DEFAULT '[]',
    "publicId" TEXT,
    "eventCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT,
    "capacity" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'A_VENIR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" INTEGER NOT NULL,
    "budget" DOUBLE PRECISION,
    "category" "EventCategory" NOT NULL DEFAULT 'REUNION',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "endDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "preparationPercentage" INTEGER NOT NULL DEFAULT 0,
    "publicId" TEXT NOT NULL,
    "eventCode" TEXT NOT NULL,
    "ownerUid" TEXT NOT NULL,
    "locationCoords" JSONB,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventCode" TEXT NOT NULL,
    "receiverEmail" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitationId" TEXT,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreparationTodoGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "order" INTEGER NOT NULL DEFAULT 0,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreparationTodoGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreparationTodo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedTo" TEXT,
    "description" TEXT,

    CONSTRAINT "PreparationTodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventByCode" (
    "id" SERIAL NOT NULL,
    "eventCode" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerUid" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventByCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserByRole" (
    "userFirstName" TEXT,
    "userRole" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userUid" TEXT NOT NULL,

    CONSTRAINT "UserByRole_pkey" PRIMARY KEY ("userUid")
);

-- CreateTable
CREATE TABLE "OrganizationInvite" (
    "id" SERIAL NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "status" "OrgInviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUid" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" SERIAL NOT NULL,
    "userUid" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationPermissions" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "adminsCanModifyEvents" BOOLEAN NOT NULL DEFAULT true,
    "adminsCanDeleteEvents" BOOLEAN NOT NULL DEFAULT true,
    "adminsCanInviteEventParticipants" BOOLEAN NOT NULL DEFAULT true,
    "adminsCanInviteMembers" BOOLEAN NOT NULL DEFAULT true,
    "adminsCanModifyOrg" BOOLEAN NOT NULL DEFAULT false,
    "membersCanInviteEventParticipants" BOOLEAN NOT NULL DEFAULT false,
    "membersCanInviteMembers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_publicId_key" ON "Organization"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_publicId_key" ON "Event"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventCode_key" ON "Event"("eventCode");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_invitationId_key" ON "Invitation"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_eventCode_receiverEmail_key" ON "Invitation"("eventCode", "receiverEmail");

-- CreateIndex
CREATE UNIQUE INDEX "EventByCode_eventCode_key" ON "EventByCode"("eventCode");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvite_inviteCode_key" ON "OrganizationInvite"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvite_organizationId_email_key" ON "OrganizationInvite"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userUid_key" ON "OrganizationMember"("organizationId", "userUid");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPermissions_organizationId_key" ON "OrganizationPermissions"("organizationId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerUid_fkey" FOREIGN KEY ("ownerUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventCode_fkey" FOREIGN KEY ("eventCode") REFERENCES "EventByCode"("eventCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerUid_fkey" FOREIGN KEY ("ownerUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_eventCode_fkey" FOREIGN KEY ("eventCode") REFERENCES "Event"("eventCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodoGroup" ADD CONSTRAINT "PreparationTodoGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodo" ADD CONSTRAINT "PreparationTodo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodo" ADD CONSTRAINT "PreparationTodo_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PreparationTodoGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserByRole" ADD CONSTRAINT "UserByRole_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_invitedByUid_fkey" FOREIGN KEY ("invitedByUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPermissions" ADD CONSTRAINT "OrganizationPermissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

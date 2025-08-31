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
CREATE UNIQUE INDEX "OrganizationPermissions_organizationId_key" ON "OrganizationPermissions"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationPermissions" ADD CONSTRAINT "OrganizationPermissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

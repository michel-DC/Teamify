/*
  Warnings:

  - You are about to drop the column `size` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `organizationType` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('ASSOCIATION', 'PME', 'ENTREPRISE', 'STARTUP', 'AUTO_ENTREPRENEUR');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "size",
ADD COLUMN     "location" JSONB,
ADD COLUMN     "organizationType" "OrganizationType" NOT NULL;

-- DropEnum
DROP TYPE "OrgSize";

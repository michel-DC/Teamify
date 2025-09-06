-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "location" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

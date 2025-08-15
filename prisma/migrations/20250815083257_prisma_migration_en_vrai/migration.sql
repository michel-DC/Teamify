/*
  Warnings:

  - The values [BROUILLON,PUBLIE] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EventStatus_new" AS ENUM ('A_VENIR', 'EN_COURS', 'TERMINE', 'ANNULE');
ALTER TABLE "public"."Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Event" ALTER COLUMN "status" TYPE "public"."EventStatus_new" USING ("status"::text::"public"."EventStatus_new");
ALTER TYPE "public"."EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "public"."EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "public"."EventStatus_old";
ALTER TABLE "public"."Event" ALTER COLUMN "status" SET DEFAULT 'A_VENIR';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "status" SET DEFAULT 'A_VENIR';

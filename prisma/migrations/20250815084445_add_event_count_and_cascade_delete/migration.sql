-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "eventCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_eventCode_fkey" FOREIGN KEY ("eventCode") REFERENCES "public"."EventByCode"("eventCode") ON DELETE CASCADE ON UPDATE CASCADE;

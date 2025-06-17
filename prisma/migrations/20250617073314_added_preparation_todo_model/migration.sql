-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "preparationPercentage" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PreparationTodo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreparationTodo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PreparationTodo" ADD CONSTRAINT "PreparationTodo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

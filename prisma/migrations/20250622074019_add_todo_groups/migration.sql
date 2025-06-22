-- AlterTable
ALTER TABLE "PreparationTodo" ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PreparationTodoGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "order" INTEGER NOT NULL DEFAULT 0,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreparationTodoGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PreparationTodoGroup" ADD CONSTRAINT "PreparationTodoGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTodo" ADD CONSTRAINT "PreparationTodo_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PreparationTodoGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."UserByRole" (
    "userId" INTEGER NOT NULL,
    "userFirstName" TEXT,
    "userRole" JSONB NOT NULL,

    CONSTRAINT "UserByRole_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."UserByRole" ADD CONSTRAINT "UserByRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

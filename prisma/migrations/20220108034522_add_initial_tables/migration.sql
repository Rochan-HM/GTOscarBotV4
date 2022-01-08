-- CreateTable
CREATE TABLE "CRN" (
    "crn_id" INTEGER NOT NULL,
    "class_name" TEXT NOT NULL,
    "class_seats" INTEGER NOT NULL,
    "waitlist_seats" INTEGER NOT NULL,

    CONSTRAINT "CRN_pkey" PRIMARY KEY ("crn_id")
);

-- CreateTable
CREATE TABLE "UserTracking" (
    "user_tracking_id" SERIAL NOT NULL,
    "userId" TEXT,
    "crnId" INTEGER NOT NULL,
    "class_alias" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "guild_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTracking_pkey" PRIMARY KEY ("user_tracking_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTracking" ADD CONSTRAINT "UserTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTracking" ADD CONSTRAINT "UserTracking_crnId_fkey" FOREIGN KEY ("crnId") REFERENCES "CRN"("crn_id") ON DELETE CASCADE ON UPDATE CASCADE;

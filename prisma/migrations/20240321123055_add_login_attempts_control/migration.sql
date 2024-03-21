-- CreateTable
CREATE TABLE "loginattempts" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loginattempts_pkey" PRIMARY KEY ("id")
);

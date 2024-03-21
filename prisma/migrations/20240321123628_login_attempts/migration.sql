/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `loginattempts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "loginattempts" ALTER COLUMN "attempts" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "loginattempts_email_key" ON "loginattempts"("email");

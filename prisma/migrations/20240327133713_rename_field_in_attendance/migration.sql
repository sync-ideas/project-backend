/*
  Warnings:

  - You are about to drop the column `registred` on the `attendances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "registred",
ADD COLUMN     "registered" BOOLEAN NOT NULL DEFAULT false;

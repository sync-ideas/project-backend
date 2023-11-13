/*
  Warnings:

  - You are about to drop the column `manual_id` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "manual_id",
ADD COLUMN     "internal_id" TEXT;

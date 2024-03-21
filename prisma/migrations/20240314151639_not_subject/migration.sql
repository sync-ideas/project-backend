/*
  Warnings:

  - You are about to drop the column `courseId` on the `subjects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_courseId_fkey";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "courseId";

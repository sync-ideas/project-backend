/*
  Warnings:

  - The primary key for the `courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `subjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_courseId_fkey";

-- AlterTable
ALTER TABLE "courses" DROP CONSTRAINT "courses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "courses_id_seq";

-- AlterTable
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT;
DROP SEQUENCE "subjects_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "active" SET DEFAULT false,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "courses_id_key" ON "courses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_id_key" ON "subjects"("id");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `nivel` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `students` table. All the data in the column will be lost.
  - The `id` column on the `students` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `nivel` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `teacher` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `level` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_phone` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manual_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- DropIndex
DROP INDEX IF EXISTS "courses_id_key" CASCADE;

-- DropIndex
DROP INDEX IF EXISTS "students_id_key" CASCADE;

-- DropIndex
DROP INDEX IF EXISTS "subjects_id_key" CASCADE;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "nivel",
ADD COLUMN     "level" TEXT NOT NULL,
ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "students" DROP COLUMN "name",
DROP COLUMN "subjects",
ADD COLUMN     "contact_phone" TEXT NOT NULL,
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "manual_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "nivel",
DROP COLUMN "teacher",
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "teacherId" TEXT NOT NULL,
ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "fullname" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'TEACHER';

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nonattendances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "nonattendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentToSubject" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StudentToSubject_AB_unique" ON "_StudentToSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentToSubject_B_index" ON "_StudentToSubject"("B");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nonattendances" ADD CONSTRAINT "nonattendances_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nonattendances" ADD CONSTRAINT "nonattendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToSubject" ADD CONSTRAINT "_StudentToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToSubject" ADD CONSTRAINT "_StudentToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('UNJUSTIFIED', 'JUSTIFIED', 'LATE', 'DELETED');

-- AlterTable
ALTER TABLE "nonattendances" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'UNJUSTIFIED';

-- CreateTable
CREATE TABLE "observations" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

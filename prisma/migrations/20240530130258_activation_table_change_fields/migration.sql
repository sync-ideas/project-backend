/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `activations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "activations_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "activations_code_key" ON "activations"("code");

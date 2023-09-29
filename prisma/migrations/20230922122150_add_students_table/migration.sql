-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjects" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "students_id_key" ON "students"("id");

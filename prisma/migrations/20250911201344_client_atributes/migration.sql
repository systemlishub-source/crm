/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "rg" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_cpf_key" ON "public"."Client"("cpf");

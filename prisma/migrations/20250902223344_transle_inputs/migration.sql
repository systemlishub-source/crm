/*
  Warnings:

  - You are about to drop the column `telefone` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `Endereco` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Endereco" DROP CONSTRAINT "Endereco_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Users" DROP COLUMN "telefone",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Endereco";

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" SERIAL NOT NULL,
    "cep" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "complement" TEXT NOT NULL,
    "userId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_key" ON "public"."Address"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_cpf_key" ON "public"."Users"("cpf");

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

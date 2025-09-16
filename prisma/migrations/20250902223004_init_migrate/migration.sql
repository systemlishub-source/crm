/*
  Warnings:

  - Added the required column `cpf` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Users" ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Endereco" (
    "id" SERIAL NOT NULL,
    "cep" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "quadra" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "userId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_id_key" ON "public"."Endereco"("id");

-- AddForeignKey
ALTER TABLE "public"."Endereco" ADD CONSTRAINT "Endereco_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

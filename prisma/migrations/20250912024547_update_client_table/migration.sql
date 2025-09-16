/*
  Warnings:

  - Made the column `email` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `birthDate` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Address" ADD COLUMN     "clientId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Client" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "birthDate" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

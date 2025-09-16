/*
  Warnings:

  - The values [Administrador] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parameters_km` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_transports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trips` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('Admin', 'UsuarioPadrao');
ALTER TABLE "public"."Users" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."trip_expenses" DROP CONSTRAINT "trip_expenses_expensesId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trip_expenses" DROP CONSTRAINT "trip_expenses_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trip_transports" DROP CONSTRAINT "trip_transports_transportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trip_transports" DROP CONSTRAINT "trip_transports_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trips" DROP CONSTRAINT "trips_parameters_kmId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trips" DROP CONSTRAINT "trips_userId_fkey";

-- DropTable
DROP TABLE "public"."expenses";

-- DropTable
DROP TABLE "public"."parameters_km";

-- DropTable
DROP TABLE "public"."transports";

-- DropTable
DROP TABLE "public"."trip_expenses";

-- DropTable
DROP TABLE "public"."trip_transports";

-- DropTable
DROP TABLE "public"."trips";

-- DropEnum
DROP TYPE "public"."TripStatus";

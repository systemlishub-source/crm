/*
  Warnings:

  - Added the required column `type` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Made the column `model` on table `Products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `Products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `Products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `material` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "model" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "material" SET NOT NULL;

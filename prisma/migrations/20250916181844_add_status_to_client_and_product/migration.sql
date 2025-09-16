-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

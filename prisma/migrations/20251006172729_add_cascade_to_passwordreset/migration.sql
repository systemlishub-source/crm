-- DropForeignKey
ALTER TABLE "public"."passwordReset" DROP CONSTRAINT "passwordReset_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."passwordReset" ADD CONSTRAINT "passwordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

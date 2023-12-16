/*
  Warnings:

  - The values [PHONE] on the enum `Providers` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Providers_new" AS ENUM ('LOCAL', 'GOOGLE', 'PHONE');
ALTER TABLE "users" ALTER COLUMN "authProviders" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "authProviders" TYPE "Providers_new" USING ("authProviders"::text::"Providers_new");
ALTER TYPE "Providers" RENAME TO "Providers_old";
ALTER TYPE "Providers_new" RENAME TO "Providers";
DROP TYPE "Providers_old";
ALTER TABLE "users" ALTER COLUMN "authProviders" SET DEFAULT 'LOCAL';
COMMIT;

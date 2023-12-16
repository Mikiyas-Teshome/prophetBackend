/*
  Warnings:

  - You are about to drop the column `authProvider` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "authProvider",
ADD COLUMN     "authProviders" "Providers" NOT NULL DEFAULT 'LOCAL';

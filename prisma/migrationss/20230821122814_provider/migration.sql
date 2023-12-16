/*
  Warnings:

  - You are about to drop the column `verificationCodeExpiresAt` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "verificationCodeExpiresAt",
ADD COLUMN     "authProvider" "Providers" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "verificationCodeExpiresAtAt" TIMESTAMP(3),
ALTER COLUMN "hash" DROP NOT NULL;

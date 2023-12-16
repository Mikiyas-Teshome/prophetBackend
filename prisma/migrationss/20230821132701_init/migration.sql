/*
  Warnings:

  - You are about to drop the column `verificationCodeExpiresAtAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "verificationCodeExpiresAtAt",
ADD COLUMN     "verificationCodeExpiresAt" TIMESTAMP(3);

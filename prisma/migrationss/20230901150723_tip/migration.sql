/*
  Warnings:

  - Changed the type of `like` on the `Tip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `disLike` on the `Tip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Tip" DROP COLUMN "like",
ADD COLUMN     "like" INTEGER NOT NULL,
DROP COLUMN "disLike",
ADD COLUMN     "disLike" INTEGER NOT NULL;

/*
  Warnings:

  - You are about to drop the `Tip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movie_play_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `web_series_episoade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `movie_play_links` DROP FOREIGN KEY `movie_play_links_movieId_fkey`;

-- DropTable
DROP TABLE `Tip`;

-- DropTable
DROP TABLE `movie_play_links`;

-- DropTable
DROP TABLE `movies`;

-- DropTable
DROP TABLE `web_series_episoade`;

-- CreateTable
CREATE TABLE `packages` (
    `id` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `priceIn_usd` DOUBLE NOT NULL,
    `priceIn_etb` DOUBLE NOT NULL,
    `packageDes` VARCHAR(191) NOT NULL,
    `duration` ENUM('ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

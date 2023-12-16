-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `verificationHash` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `authProviders` ENUM('LOCAL', 'GOOGLE', 'PHONE') NOT NULL DEFAULT 'LOCAL',
    `providerId` VARCHAR(191) NULL,
    `verificationCodeExpiresAt` DATETIME(3) NULL,
    `isPassResetEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tip` (
    `id` VARCHAR(191) NOT NULL,
    `home` VARCHAR(191) NOT NULL,
    `homeScore` VARCHAR(191) NOT NULL,
    `visitor` VARCHAR(191) NOT NULL,
    `visitorScore` VARCHAR(191) NOT NULL,
    `bet` VARCHAR(191) NOT NULL,
    `rate` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `league` VARCHAR(191) NOT NULL,
    `flag` VARCHAR(191) NOT NULL,
    `like` INTEGER NOT NULL,
    `disLike` INTEGER NOT NULL,
    `isLiked` BOOLEAN NOT NULL,
    `isDisliked` BOOLEAN NOT NULL,
    `publicRow` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tip_publicRow_key`(`publicRow`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_series_episoade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Episoade_Name` TEXT NOT NULL,
    `episoade_image` TEXT NOT NULL,
    `episoade_description` TEXT NOT NULL,
    `episoade_order` INTEGER NOT NULL,
    `season_id` INTEGER NOT NULL,
    `downloadable` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `source` TEXT NOT NULL,
    `url` TEXT NOT NULL,
    `skip_available` INTEGER NOT NULL DEFAULT 0,
    `intro_start` TEXT NOT NULL,
    `intro_end` TEXT NOT NULL,
    `end_credits_marker` TEXT NOT NULL,
    `drm_uuid` TEXT NOT NULL,
    `drm_license_uri` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `TMDB_ID` INTEGER NOT NULL,
    `name` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `genres` TEXT NOT NULL,
    `release_date` TEXT NOT NULL,
    `runtime` TEXT NOT NULL,
    `poster` TEXT NOT NULL,
    `banner` TEXT NOT NULL,
    `youtube_trailer` TEXT NOT NULL,
    `downloadable` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `content_type` INTEGER NOT NULL,
    `video_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `movies_video_id_key`(`video_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movie_play_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL DEFAULT '',
    `size` TEXT NOT NULL DEFAULT '',
    `quality` TEXT NOT NULL DEFAULT '',
    `link_order` INTEGER NOT NULL,
    `movieId` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `type` TEXT NOT NULL,
    `status` TEXT NOT NULL,
    `skip_available` INTEGER NOT NULL,
    `intro_start` TEXT NOT NULL,
    `intro_end` TEXT NOT NULL,
    `end_credits_marker` TEXT NOT NULL,
    `link_type` INTEGER NOT NULL DEFAULT 1,
    `drm_uuid` TEXT NOT NULL,
    `drm_license_uri` TEXT NOT NULL,

    UNIQUE INDEX `movie_play_links_movieId_key`(`movieId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `movie_play_links` ADD CONSTRAINT `movie_play_links_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

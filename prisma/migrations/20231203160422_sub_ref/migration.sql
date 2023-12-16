-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isRenewed` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `purchaseReferenceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_userId_key`(`userId`),
    UNIQUE INDEX `subscriptions_packageId_key`(`packageId`),
    UNIQUE INDEX `subscriptions_purchaseReferenceId_key`(`purchaseReferenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchaseReferences` (
    `id` VARCHAR(191) NOT NULL,
    `trx` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `ammount` DOUBLE NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchaseReferences_userId_key`(`userId`),
    UNIQUE INDEX `purchaseReferences_packageId_key`(`packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_purchaseReferenceId_fkey` FOREIGN KEY (`purchaseReferenceId`) REFERENCES `purchaseReferences`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseReferences` ADD CONSTRAINT `purchaseReferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchaseReferences` ADD CONSTRAINT `purchaseReferences_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

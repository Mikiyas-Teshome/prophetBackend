/*
  Warnings:

  - A unique constraint covering the columns `[trx]` on the table `purchaseReferences` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `purchaseReferences_trx_key` ON `purchaseReferences`(`trx`);

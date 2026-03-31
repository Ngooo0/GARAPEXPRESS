ALTER TABLE `Pharmacie`
    ADD COLUMN `telephone` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `motDePasse` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Pharmacie_email_key` ON `Pharmacie`(`email`);

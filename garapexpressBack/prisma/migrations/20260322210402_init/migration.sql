-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Livreur` (
    `id` INTEGER NOT NULL,
    `vehicule` VARCHAR(191) NOT NULL,
    `disponibilite` BOOLEAN NOT NULL,
    `noteMoyenne` DOUBLE NOT NULL,
    `immatriculation` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pharmacie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raisonSociale` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `numeroAgrement` VARCHAR(191) NOT NULL,
    `estDeGarde` BOOLEAN NOT NULL,
    `horaires` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicament` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `DCI` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `surOrdonnance` BOOLEAN NOT NULL,
    `stock` INTEGER NOT NULL,
    `prix` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CataloguePharmacie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prix` DOUBLE NOT NULL,
    `quantiteStock` INTEGER NOT NULL,
    `disponibilite` BOOLEAN NOT NULL,
    `dateMAJ` DATETIME(3) NOT NULL,
    `pharmacieId` INTEGER NOT NULL,
    `medicamentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commande` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateCommande` DATETIME(3) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `montantTotal` DOUBLE NOT NULL,
    `adresseLivraison` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `pharmacieId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Livraison` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `heureDepart` DATETIME(3) NOT NULL,
    `heureArrivee` DATETIME(3) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `commandeId` INTEGER NOT NULL,
    `livreurId` INTEGER NOT NULL,

    UNIQUE INDEX `Livraison_commandeId_key`(`commandeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paiement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `montant` DOUBLE NOT NULL,
    `modePaiement` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `dateTransaction` DATETIME(3) NOT NULL,
    `commandeId` INTEGER NOT NULL,

    UNIQUE INDEX `Paiement_commandeId_key`(`commandeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ordonnance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateEmission` DATETIME(3) NOT NULL,
    `fichier` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `commandeId` INTEGER NOT NULL,

    UNIQUE INDEX `Ordonnance_commandeId_key`(`commandeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `dateEnvoi` DATETIME(3) NOT NULL,
    `lu` BOOLEAN NOT NULL,
    `utilisateurId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_id_fkey` FOREIGN KEY (`id`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Livreur` ADD CONSTRAINT `Livreur_id_fkey` FOREIGN KEY (`id`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_id_fkey` FOREIGN KEY (`id`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CataloguePharmacie` ADD CONSTRAINT `CataloguePharmacie_pharmacieId_fkey` FOREIGN KEY (`pharmacieId`) REFERENCES `Pharmacie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CataloguePharmacie` ADD CONSTRAINT `CataloguePharmacie_medicamentId_fkey` FOREIGN KEY (`medicamentId`) REFERENCES `Medicament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_pharmacieId_fkey` FOREIGN KEY (`pharmacieId`) REFERENCES `Pharmacie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Livraison` ADD CONSTRAINT `Livraison_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Livraison` ADD CONSTRAINT `Livraison_livreurId_fkey` FOREIGN KEY (`livreurId`) REFERENCES `Livreur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paiement` ADD CONSTRAINT `Paiement_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ordonnance` ADD CONSTRAINT `Ordonnance_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

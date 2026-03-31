import { PrismaClient } from "@prisma/client";
import { PaiementRepository } from "../repositories/paiementRepository";
import { PaiementService } from "../services/paiementService";
import { PaiementController } from "../controllers/paiementController";

// @ts-ignore - Prisma 7 requires adapter or accelerateUrl
const prisma = new PrismaClient({} as any);

export class PaiementConteneur {
    private static instance: Map<string, any> = new Map();

    static get<T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}

export const paiementPrisma = PaiementConteneur.get("prisma", () => prisma);
export const paiementRepo = PaiementConteneur.get("paiementRepo", () => new PaiementRepository(paiementPrisma));
export const paiementService = PaiementConteneur.get("paiementService", () => new PaiementService(paiementRepo));
export const paiementController = PaiementConteneur.get("paiementController", () => new PaiementController(paiementService));

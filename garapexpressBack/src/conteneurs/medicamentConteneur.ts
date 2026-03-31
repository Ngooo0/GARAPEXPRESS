import { PrismaClient } from "@prisma/client";
import { MedicamentRepository } from "../repositories/medicamentRepository";
import { MedicamentService } from "../services/medicamentService";
import { MedicamentController } from "../controllers/medicamentController";

// @ts-ignore - Prisma 7 requires adapter or accelerateUrl
const prisma = new PrismaClient({} as any);

export class MedicamentConteneur {
    private static instance: Map<string, any> = new Map();

    static get<T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}

export const medicamentPrisma = MedicamentConteneur.get("prisma", () => prisma);
export const medicamentRepo = MedicamentConteneur.get("medicamentRepo", () => new MedicamentRepository(medicamentPrisma));
export const medicamentService = MedicamentConteneur.get("medicamentService", () => new MedicamentService(medicamentRepo));
export const medicamentController = MedicamentConteneur.get("medicamentController", () => new MedicamentController(medicamentService));

import { PrismaClient } from "@prisma/client";
import { OrdonnanceRepository } from "../repositories/ordonnanceRepository";
import { OrdonnanceService } from "../services/ordonnanceService";
import { OrdonnanceController } from "../controllers/ordonnanceController";

// @ts-ignore - Prisma 7 requires adapter or accelerateUrl
const prisma = new PrismaClient({} as any);

export class OrdonnanceConteneur {
    private static instance: Map<string, any> = new Map();

    static get<T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}

export const ordonnancePrisma = OrdonnanceConteneur.get("prisma", () => prisma);
export const ordonnanceRepo = OrdonnanceConteneur.get("ordonnanceRepo", () => new OrdonnanceRepository(ordonnancePrisma));
export const ordonnanceService = OrdonnanceConteneur.get("ordonnanceService", () => new OrdonnanceService(ordonnanceRepo));
export const ordonnanceController = OrdonnanceConteneur.get("ordonnanceController", () => new OrdonnanceController(ordonnanceService));

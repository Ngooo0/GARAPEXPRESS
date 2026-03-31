import { PrismaClient } from "@prisma/client";
import { PharmacieRepository } from "../repositories/pharmacieRepository";
import { PharmacieService } from "../services/pharmacieService";
import { PharmacieController } from "../controllers/pharmacieController";

// @ts-ignore - Prisma 7 requires adapter or accelerateUrl
const prisma = new PrismaClient({} as any);

export class PharmacieConteneur {
    private static instance: Map<string, any> = new Map();

    static get<T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}

export const pharmaciePrisma = PharmacieConteneur.get("prisma", () => prisma);
export const pharmacieRepo = PharmacieConteneur.get("pharmacieRepo", () => new PharmacieRepository(pharmaciePrisma));
export const pharmacieService = PharmacieConteneur.get("pharmacieService", () => new PharmacieService(pharmacieRepo));
export const pharmacieController = PharmacieConteneur.get("pharmacieController", () => new PharmacieController(pharmacieService));

import { PrismaClient } from "@prisma/client";
import { LivraisonRepository } from "../repositories/livraisonRepository";
import { LivraisonService } from "../services/livraisonService";
import { LivraisonController } from "../controllers/livraisonController";

// @ts-ignore - Prisma 7 requires adapter or accelerateUrl
const prisma = new PrismaClient({} as any);

export class LivraisonConteneur {
    private static instance: Map<string, any> = new Map();

    static get<T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}

export const livraisonPrisma = LivraisonConteneur.get("prisma", () => prisma);
export const livraisonRepo = LivraisonConteneur.get("livraisonRepo", () => new LivraisonRepository(livraisonPrisma));
export const livraisonService = LivraisonConteneur.get("livraisonService", () => new LivraisonService(livraisonRepo));
export const livraisonController = LivraisonConteneur.get("livraisonController", () => new LivraisonController(livraisonService));

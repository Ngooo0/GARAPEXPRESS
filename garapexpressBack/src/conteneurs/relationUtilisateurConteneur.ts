import { PrismaClient, Prisma } from "@prisma/client";
import { RelationUtilisateurRepository } from "../repositories/relationUtilisateurRepository";
import { RelationUtilisateurService } from "../services/relationUtilisateurService";
import { RelationUtilisateurController } from "../controllers/relationUtilisateurController";
import dotenv from "dotenv";
dotenv.config();

export class RelationUtilisateurConteneur {
    private static instance : Map<string, any> = new Map();

    static get <T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}
export const relationPrisma = RelationUtilisateurConteneur.get("prisma", () => new PrismaClient({} as any));
export const relationUtilisateurRepo = RelationUtilisateurConteneur.get("relationRepo", () => new RelationUtilisateurRepository(relationPrisma));
export const relationUtilisateurService = RelationUtilisateurConteneur.get("relationService", () => new RelationUtilisateurService(relationUtilisateurRepo));
export const relationUtilisateurController = RelationUtilisateurConteneur.get("relationController", () => new RelationUtilisateurController(relationUtilisateurService));
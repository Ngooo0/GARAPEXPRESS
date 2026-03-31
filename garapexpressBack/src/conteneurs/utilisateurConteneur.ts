
import { PrismaClient, Prisma } from "@prisma/client";
import { UtilisateurRepository } from "../repositories/utilisateurRepository";
import { UtilisateurService } from "../services/utilisateurService";
import { UtilisateurController } from "../controllers/utilisateurController";
import dotenv from "dotenv";
dotenv.config();

export class utilisateurConteneur {
    private static instance : Map<string, any> = new Map();

    static get <T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}
export const utilisateurPrisma = utilisateurConteneur.get("prisma", () => new PrismaClient({} as any));
export const utilisateurRepo = utilisateurConteneur.get("utilisateurRepo", () => new UtilisateurRepository(utilisateurPrisma));
export const utilisateurService = utilisateurConteneur.get("utilisateurService", () => new UtilisateurService(utilisateurRepo));
export const utilisateurController = utilisateurConteneur.get("utilisateurController", () => new UtilisateurController(utilisateurService));

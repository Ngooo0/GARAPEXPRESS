import { PrismaClient } from "@prisma/client";
import { CommandeRepository } from "../repositories/commandeRepository";
import { CommandeService } from "../services/commandeService";
import { CommandeController } from "../controllers/commandeController";

// @ts-ignore - Prisma 7 requires adapter or accelerateUrl
const prisma = new PrismaClient({} as any);

export class CommandeConteneur {
    private static instance: Map<string, any> = new Map();

    static get<T>(key: string, creator: () => T): T {
        if (!this.instance.has(key)) {
            this.instance.set(key, creator());
        }
        return this.instance.get(key);
    }
}

export const commandePrisma = CommandeConteneur.get("prisma", () => prisma);
export const commandeRepo = CommandeConteneur.get("commandeRepo", () => new CommandeRepository(commandePrisma));
export const commandeService = CommandeConteneur.get("commandeService", () => new CommandeService(commandeRepo));
export const commandeController = CommandeConteneur.get("commandeController", () => new CommandeController(commandeService));

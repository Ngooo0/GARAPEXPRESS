import { PrismaClient, Prisma, Utilisateur } from "@prisma/client";

export class UtilisateurRepository {
    constructor(private prisma: PrismaClient) { }

    async findAll() {
        return this.prisma.utilisateur.findMany({
            include: {
                client: true,
                livreur: true,
                admin: true,
            }
        });
    }

    async findById(id: number) {
        return this.prisma.utilisateur.findUnique({
            where: { id },
            include: {
                client: true,
                livreur: true,
                admin: true,
            }
        });
    }
    async getUserByEmail(email: string) : Promise<Utilisateur | null> {
        return this.prisma.utilisateur.findUnique({ 
            where: { email },
            include: {
                client: true,
                livreur: true,
                admin: true
            }
        });
    }

    async create(item: Prisma.UtilisateurCreateInput) {
        return this.prisma.utilisateur.create({ data: item });
    }

    async update(id: number, item: Prisma.UtilisateurUpdateInput) {
        return this.prisma.utilisateur.update({
            where: { id },
            data: item,
        });
    }

    async updateLivreurDisponibilite(id: number, disponibilite: boolean) {
        return this.prisma.livreur.update({
            where: { id },
            data: { disponibilite },
            include: {
                utilisateur: true,
                livraisons: true,
            }
        });
    }

    async delete(id: number) {
        await this.prisma.utilisateur.delete({
            where: { id },
        });
    }
}

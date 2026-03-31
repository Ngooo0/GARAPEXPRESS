import { PrismaClient, Notification } from "@prisma/client";

export class NotificationRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(): Promise<Notification[]> {
        return this.prisma.notification.findMany({ include: { utilisateur: true } });
    }

    async findById(id: number): Promise<Notification | null> {
        return this.prisma.notification.findUnique({ where: { id }, include: { utilisateur: true } });
    }

    async findByUtilisateurId(utilisateurId: number): Promise<Notification[]> {
        return this.prisma.notification.findMany({
            where: { utilisateurId },
            orderBy: { dateEnvoi: 'desc' }
        });
    }

    async findNonLues(utilisateurId: number): Promise<Notification[]> {
        return this.prisma.notification.findMany({
            where: { utilisateurId, lu: false },
            orderBy: { dateEnvoi: 'desc' }
        });
    }

    async create(data: { message: string; type: string; dateEnvoi: Date | string; lu: boolean; utilisateurId: number }): Promise<Notification> {
        return this.prisma.notification.create({
            data: { ...data, dateEnvoi: new Date(data.dateEnvoi) },
        });
    }

    async update(id: number, data: { message?: string; type?: string; lu?: boolean }): Promise<Notification> {
        return this.prisma.notification.update({ where: { id }, data });
    }

    async markAsRead(id: number): Promise<Notification> {
        return this.prisma.notification.update({ where: { id }, data: { lu: true } });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.notification.delete({ where: { id } });
    }
}

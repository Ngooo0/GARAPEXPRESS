import { NotificationRepository } from "../repositories/notificationRepository";
import { Notification } from "@prisma/client";

export class NotificationService {
    constructor(private notificationRepository: NotificationRepository) {}

    async getAllNotifications(): Promise<Notification[]> {
        return this.notificationRepository.findAll();
    }

    async getNotificationById(id: number): Promise<Notification | null> {
        return this.notificationRepository.findById(id);
    }

    async getNotificationsByUtilisateur(utilisateurId: number): Promise<Notification[]> {
        return this.notificationRepository.findByUtilisateurId(utilisateurId);
    }

    async getNonLues(utilisateurId: number): Promise<Notification[]> {
        return this.notificationRepository.findNonLues(utilisateurId);
    }

    async createNotification(data: { message: string; type: string; dateEnvoi: Date | string; lu: boolean; utilisateurId: number }): Promise<Notification> {
        return this.notificationRepository.create(data);
    }

    async updateNotification(id: number, data: { message?: string; type?: string; lu?: boolean }): Promise<Notification> {
        return this.notificationRepository.update(id, data);
    }

    async markAsRead(id: number): Promise<Notification> {
        return this.notificationRepository.markAsRead(id);
    }

    async deleteNotification(id: number): Promise<void> {
        return this.notificationRepository.delete(id);
    }
}

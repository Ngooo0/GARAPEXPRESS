import { NotificationService } from "../services/notificationService";
import { NotificationValidator, NotificationUpdateValidator } from "../validators/notificationValidator";

export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    async getAllNotifications(req: any, res: any) {
        try {
            const notifications = await this.notificationService.getAllNotifications();
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getNotificationById(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const notification = await this.notificationService.getNotificationById(id);
            if (notification) {
                res.status(200).json(notification);
            } else {
                res.status(404).json({ error: 'Notification not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getNotificationsByUtilisateur(req: any, res: any) {
        try {
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            const notifications = await this.notificationService.getNotificationsByUtilisateur(utilisateurId);
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getNonLues(req: any, res: any) {
        try {
            const utilisateurId = parseInt(req.params.utilisateurId, 10);
            const notifications = await this.notificationService.getNonLues(utilisateurId);
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createNotification(req: any, res: any) {
        try {
            const validatedData = NotificationValidator.parse(req.body);
            const newNotification = await this.notificationService.createNotification(validatedData);
            res.status(201).json({ success: true, message: 'Notification created successfully', data: newNotification });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error creating notification' });
        }
    }

    async markAsRead(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            const updatedNotification = await this.notificationService.markAsRead(id);
            res.status(200).json({ success: true, message: 'Notification marked as read', data: updatedNotification });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error updating notification' });
        }
    }

    async deleteNotification(req: any, res: any) {
        try {
            const id = parseInt(req.params.id, 10);
            await this.notificationService.deleteNotification(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Error deleting notification' });
        }
    }
}

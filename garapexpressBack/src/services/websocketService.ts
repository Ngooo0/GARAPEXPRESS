import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, string> = new Map();

  // Initialiser le serveur WebSocket
  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('Nouveau client connecté:', socket.id);

      // Authentifier l'utilisateur
      socket.on('authenticate', (userId: number) => {
        this.connectedUsers.set(userId, socket.id);
        console.log(`Utilisateur ${userId} authentifié sur socket ${socket.id}`);
      });

      // Déconnexion
      socket.on('disconnect', () => {
        // Retirer l'utilisateur de la liste
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            break;
          }
        }
        console.log('Client déconnecté:', socket.id);
      });

      // Rejoindre une salle (pour les rooms)
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
        console.log(`Socket ${socket.id} a rejoint la room: ${room}`);
      });

      // Quitter une salle
      socket.on('leaveRoom', (room: string) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} a quitté la room: ${room}`);
      });
    });
  }

  // Envoyer une notification à un utilisateur
  sendToUser(userId: number, event: string, data: any): void {
    if (!this.io) return;

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Envoyer à tous les utilisateurs d'une salle
  sendToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  // Notifications de commande
  notifyCommandeUpdate(commandeId: number, clientId: number, statut: string): void {
    this.sendToUser(clientId, 'commande_update', {
      commandeId,
      statut,
      message: `Votre commande #${commandeId} est maintenant: ${statut}`
    });
  }

  // Notifications de livraison
  notifyLivraisonUpdate(livraisonId: number, livreurId: number, statut: string): void {
    this.sendToUser(livreurId, 'livraison_update', {
      livraisonId,
      statut,
      message: `Livraison #${livraisonId}: ${statut}`
    });
  }

  // Notification de nouvelle commande pour pharmacie
  notifyNouvelleCommande(pharmacieId: number, commandeId: number): void {
    this.sendToRoom(`pharmacie_${pharmacieId}`, 'nouvelle_commande', {
      commandeId,
      message: `Nouvelle commande #${commandeId} à préparer`
    });
  }

  // Notification de nouvelle livraison pour livreur
  notifyNouvelleLivraison(livreurId: number, livraisonId: number): void {
    this.sendToUser(livreurId, 'nouvelle_livraison', {
      livraisonId,
      message: `Nouvelle livraison #${livraisonId} disponible`
    });
  }

  notifyLivraisonPosition(livraisonId: number, data: any): void {
    this.sendToRoom(`livraison_${livraisonId}`, 'livraison_position', data);
  }

  // Broadcast global (pour les admins)
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

export const wsService = new WebSocketService();

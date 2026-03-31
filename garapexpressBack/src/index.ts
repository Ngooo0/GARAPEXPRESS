import express from 'express';
import { createServer } from 'http';
import path from 'path';

import utilisateurRouter from './routes/utilisateurRoute';
import pharmacieRouter from './routes/pharmacieRoute';
import medicamentRouter from './routes/medicamentRoute';
import commandeRouter from './routes/commandeRoute';
import livraisonRouter from './routes/livraisonRoute';
import paiementRouter from './routes/paiementRoute';
import ordonnanceRouter from './routes/ordonnanceRoute';
import ordonnanceExtendedRouter from './routes/ordonnanceExtendedRoute';
import notificationRouter from './routes/notificationRoute';
import livraisonExtendedRouter from './routes/livraisonExtendedRoute';
import pharmacieExtendedRouter from './routes/pharmacieExtendedRoute';
import statsRouter from './routes/statsRoute';
import relationUtilisateurRouter from './routes/relationUtilisateurRoute';
import { utilisateurPrisma } from './conteneurs/utilisateurConteneur';
import { CataloguePharmacieConteneur } from './conteneurs/cataloguePharmacieConteneur';

import { wsService } from './services/websocketService';
import { logRequest, errorHandler, notFound } from './middleware/errorHandler';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const { router: cataloguePharmacieRouter } = CataloguePharmacieConteneur.getInstance(utilisateurPrisma);

wsService.initialize(httpServer);


app.use((req, res, next) => {
  
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Token'
    );
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/utilisateurs', utilisateurRouter);
app.use('/api/utilisateurs/relations', relationUtilisateurRouter);
app.use('/api/pharmacies/extended', pharmacieExtendedRouter);
app.use('/api/pharmacies', pharmacieRouter);
app.use('/api/medicaments', medicamentRouter);
app.use('/api/commandes', commandeRouter);
app.use('/api/livraisons', livraisonRouter);
app.use('/api/livraisons/extended', livraisonExtendedRouter);
app.use('/api/paiements', paiementRouter);
app.use('/api/ordonnances', ordonnanceRouter);
app.use('/api/ordonnances/extended', ordonnanceExtendedRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/catalogues', cataloguePharmacieRouter);
app.use('/api/stats', statsRouter);

// Root route
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'GarapExpress API is running', version: '1.0.0' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'GarapExpress API is running' });
});

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server initialized`);
});

export default app;

import { Request, Response, NextFunction } from 'express';

// Interface pour les erreurs personnalisées
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Gestionnaire d'erreurs global
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Erreur:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Erreurs de validation Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: 'Erreur de base de données'
    });
    return;
  }

  // Erreurs Multer (upload)
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
    return;
  }

  // Erreur par défaut
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur'
  });
}

// Middleware pour les routes non trouvees
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} non trouvée`
  });
}

// Fonction pour logger les requetes
export function logRequest(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
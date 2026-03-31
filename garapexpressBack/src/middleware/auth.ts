import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'garapexpress_secret_key_2024';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'client' | 'livreur' | 'admin';
  };
}

// Generer un token JWT
export function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verifier le token JWT
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware d'authentification
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Token manquant' });
    return;
  }
  
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    res.status(401).json({ error: 'Token invalide' });
    return;
  }
  
  req.user = decoded as { id: number; email: string; role: 'client' | 'livreur' | 'admin' };
  next();
}

// Middleware pour verifier le role
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifie' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }
    
    next();
  };
}

export { JWT_SECRET };
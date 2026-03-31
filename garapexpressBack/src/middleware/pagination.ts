import { Request, Response, NextFunction } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Middleware de pagination
export function paginate(req: Request, res: Response, next: NextFunction): void {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  // Limiter les resultats entre 1 et 100
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  
  const skip = (safePage - 1) * safeLimit;
  
  (req as any).pagination = {
    page: safePage,
    limit: safeLimit,
    skip
  };
  
  next();
}

// Fonction utilitaire pour formater la reponse paginee
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

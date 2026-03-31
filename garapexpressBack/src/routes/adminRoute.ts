import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Run migrations manually
router.post('/migrate', async (req: Request, res: Response) => {
  try {
    // Check if admin token is provided
    const token = req.headers['x-admin-token'];
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Running Prisma migrations...');
    
    // This will run all pending migrations
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    return res.status(200).json({ 
      message: 'Migrations completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      error: 'Migration failed',
      details: error.message
    });
  }
});

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

export default router;

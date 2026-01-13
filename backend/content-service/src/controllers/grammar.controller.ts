import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

class GrammarController {
  async listGrammar(req: Request, res: Response) {
    try {
      const { q, level, category, limit = '50', offset = '0' } = req.query as any;

      const where: any = { isActive: true };
      if (q) {
        where.OR = [
          { pattern: { contains: q, mode: 'insensitive' } },
          { meaning: { contains: q, mode: 'insensitive' } },
          { explanation: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (level) where.jlptLevel = level;
      if (category) where.category = { contains: category, mode: 'insensitive' };

      const [items, total] = await Promise.all([
        prisma.grammarPoint.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          take: parseInt(limit, 10) || 50,
          skip: parseInt(offset, 10) || 0,
        }),
        prisma.grammarPoint.count({ where }),
      ]);

      res.status(200).json({ items, meta: { total, limit: Number(limit), offset: Number(offset) } });
    } catch (error: any) {
      logger.error('listGrammar failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list grammar' });
    }
  }
}

export const grammarController = new GrammarController();



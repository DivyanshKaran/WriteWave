import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

class RadicalController {
  async listRadicals(req: Request, res: Response) {
    try {
      const { q, strokes } = req.query as { q?: string; strokes?: string };

      const where: any = {
        radical: { not: null },
      };
      if (q) {
        where.OR = [
          { radical: { contains: q } },
          { radicalMeaning: { contains: q, mode: 'insensitive' } },
          { character: { contains: q } },
        ];
      }

      // Fetch sample of characters to derive radicals
      const characters = await prisma.character.findMany({
        where,
        select: { character: true, radical: true, radicalMeaning: true, strokeCount: true },
        take: 10000,
      });

      const map = new Map<string, { id: string; radical: string; name?: string; strokes?: number; examples: string[] }>();
      for (const ch of characters) {
        if (!ch.radical) continue;
        const key = ch.radical;
        const entry = map.get(key) || { id: key, radical: key, name: ch.radicalMeaning || undefined, strokes: ch.strokeCount || undefined, examples: [] };
        if (entry.examples.length < 3 && ch.character) entry.examples.push(ch.character);
        if (!entry.name && ch.radicalMeaning) entry.name = ch.radicalMeaning;
        if (!entry.strokes && ch.strokeCount) entry.strokes = ch.strokeCount;
        map.set(key, entry);
      }

      let result = Array.from(map.values());
      if (strokes) {
        const s = parseInt(strokes, 10);
        if (!isNaN(s)) result = result.filter(r => (r.strokes || 0) === s);
      }

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('listRadicals failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list radicals' });
    }
  }
}

export const radicalController = new RadicalController();



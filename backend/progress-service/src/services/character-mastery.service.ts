import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { config } from '../config';
import { 
  CharacterMastery, 
  CharacterMasteryInput, 
  CharacterType, 
  MasteryLevel,
  PracticeSession,
  PracticeSessionInput
} from '../types';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';
import moment from 'moment';

export class CharacterMasteryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Get character mastery for user
  async getCharacterMastery(userId: string, characterId: string): Promise<{ success: boolean; data?: CharacterMastery; message: string; error?: string }> {
    try {
      const cacheKey = `character_mastery:${userId}:${characterId}`;
      const cached = await cacheGet<CharacterMastery>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Character mastery retrieved from cache'
        };
      }

      const mastery = await this.prisma.characterMastery.findUnique({
        where: {
          userId_characterId: {
            userId,
            characterId
          }
        }
      });

      if (!mastery) {
        return {
          success: false,
          message: 'Character mastery not found',
          error: 'MASTERY_NOT_FOUND'
        };
      }

      // Cache the result
      await cacheSet(cacheKey, mastery, config.CACHE_TTL);

      return {
        success: true,
        data: mastery,
        message: 'Character mastery retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get character mastery', { userId, characterId, error: error.message });
      return {
        success: false,
        message: 'Failed to get character mastery',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get all character masteries for user
  async getUserCharacterMasteries(userId: string, characterType?: CharacterType): Promise<{ success: boolean; data?: CharacterMastery[]; message: string; error?: string }> {
    try {
      const cacheKey = `user_character_masteries:${userId}:${characterType || 'all'}`;
      const cached = await cacheGet<CharacterMastery[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User character masteries retrieved from cache'
        };
      }

      const whereClause: any = { userId };
      if (characterType) {
        whereClause.characterType = characterType;
      }

      const masteries = await this.prisma.characterMastery.findMany({
        where: whereClause,
        orderBy: [
          { masteryLevel: 'desc' },
          { accuracyScore: 'desc' },
          { lastPracticed: 'desc' }
        ]
      });

      // Cache the result
      await cacheSet(cacheKey, masteries, config.CACHE_TTL);

      return {
        success: true,
        data: masteries,
        message: 'User character masteries retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user character masteries', { userId, characterType, error: error.message });
      return {
        success: false,
        message: 'Failed to get user character masteries',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Update character mastery after practice
  async updateCharacterMastery(
    userId: string, 
    characterId: string, 
    characterType: CharacterType,
    accuracy: number,
    timeSpent: number,
    isPerfect: boolean,
    strokesCorrect: number,
    strokesTotal: number
  ): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Get or create character mastery
        let mastery = await tx.characterMastery.findUnique({
          where: {
            userId_characterId: {
              userId,
              characterId
            }
          }
        });

        if (!mastery) {
          mastery = await tx.characterMastery.create({
            data: {
              userId,
              characterId,
              characterType,
              masteryLevel: MasteryLevel.LEARNING,
              accuracyScore: accuracy,
              practiceCount: 1,
              correctCount: isPerfect ? 1 : 0,
              totalTimeSpent: timeSpent,
              lastPracticed: new Date(),
              streakCount: 1,
              difficultyRating: 1.0,
              strokeOrderScore: (strokesCorrect / strokesTotal) * 100,
              recognitionScore: accuracy
            }
          });
        } else {
          // Update existing mastery
          const newPracticeCount = mastery.practiceCount + 1;
          const newCorrectCount = mastery.correctCount + (isPerfect ? 1 : 0);
          const newTotalTimeSpent = mastery.totalTimeSpent + timeSpent;
          
          // Calculate new accuracy score (weighted average)
          const newAccuracyScore = (mastery.accuracyScore * mastery.practiceCount + accuracy) / newPracticeCount;
          
          // Update stroke order score
          const newStrokeOrderScore = (mastery.strokeOrderScore * mastery.practiceCount + (strokesCorrect / strokesTotal) * 100) / newPracticeCount;
          
          // Update recognition score
          const newRecognitionScore = (mastery.recognitionScore * mastery.practiceCount + accuracy) / newPracticeCount;
          
          // Update streak count
          const lastPracticed = mastery.lastPracticed ? moment(mastery.lastPracticed) : null;
          const now = moment();
          let newStreakCount = mastery.streakCount;
          
          if (lastPracticed && now.diff(lastPracticed, 'days') === 1) {
            newStreakCount += 1;
          } else if (lastPracticed && now.diff(lastPracticed, 'days') > 1) {
            newStreakCount = 1;
          }
          
          // Determine new mastery level
          let newMasteryLevel = mastery.masteryLevel;
          if (newAccuracyScore >= 95 && newPracticeCount >= 10) {
            newMasteryLevel = MasteryLevel.EXPERT;
          } else if (newAccuracyScore >= 90 && newPracticeCount >= 5) {
            newMasteryLevel = MasteryLevel.MASTERED;
          } else if (newAccuracyScore >= 80 && newPracticeCount >= 3) {
            newMasteryLevel = MasteryLevel.PRACTICING;
          }
          
          // Calculate next review date (spaced repetition)
          const nextReviewDate = this.calculateNextReviewDate(newMasteryLevel, newAccuracyScore, newStreakCount);
          
          mastery = await tx.characterMastery.update({
            where: {
              userId_characterId: {
                userId,
                characterId
              }
            },
            data: {
              masteryLevel: newMasteryLevel,
              accuracyScore: newAccuracyScore,
              practiceCount: newPracticeCount,
              correctCount: newCorrectCount,
              totalTimeSpent: newTotalTimeSpent,
              lastPracticed: new Date(),
              streakCount: newStreakCount,
              strokeOrderScore: newStrokeOrderScore,
              recognitionScore: newRecognitionScore,
              nextReviewDate
            }
          });
        }

        // Create practice session record
        const practiceSession = await tx.practiceSession.create({
          data: {
            characterMasteryId: mastery.id,
            userId,
            characterId,
            startTime: new Date(Date.now() - timeSpent * 1000),
            endTime: new Date(),
            duration: timeSpent,
            accuracy,
            strokesCorrect,
            strokesTotal,
            xpEarned: this.calculateXpEarned(accuracy, timeSpent, isPerfect),
            isPerfect,
            notes: isPerfect ? 'Perfect practice session' : undefined
          }
        });

        return { mastery, practiceSession };
      });

      // Clear cache
      await cacheDel(`character_mastery:${userId}:${characterId}`);
      await cacheDel(`user_character_masteries:${userId}:all`);
      await cacheDel(`user_character_masteries:${userId}:${characterType}`);

      logger.info('Character mastery updated successfully', {
        userId,
        characterId,
        characterType,
        accuracy,
        masteryLevel: result.mastery.masteryLevel
      });

      return {
        success: true,
        data: result,
        message: 'Character mastery updated successfully'
      };
    } catch (error) {
      logger.error('Failed to update character mastery', { userId, characterId, error: error.message });
      return {
        success: false,
        message: 'Failed to update character mastery',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate next review date for spaced repetition
  private calculateNextReviewDate(masteryLevel: MasteryLevel, accuracyScore: number, streakCount: number): Date {
    let daysToAdd = 1; // Default: review tomorrow

    switch (masteryLevel) {
      case MasteryLevel.LEARNING:
        daysToAdd = 1;
        break;
      case MasteryLevel.PRACTICING:
        daysToAdd = 3;
        break;
      case MasteryLevel.MASTERED:
        daysToAdd = 7;
        break;
      case MasteryLevel.EXPERT:
        daysToAdd = 14;
        break;
    }

    // Adjust based on accuracy and streak
    if (accuracyScore >= 95) {
      daysToAdd *= 2;
    } else if (accuracyScore < 70) {
      daysToAdd = Math.max(1, Math.floor(daysToAdd / 2));
    }

    if (streakCount >= 5) {
      daysToAdd = Math.floor(daysToAdd * 1.5);
    }

    return moment().add(daysToAdd, 'days').toDate();
  }

  // Calculate XP earned from practice session
  private calculateXpEarned(accuracy: number, timeSpent: number, isPerfect: boolean): number {
    let xp = 10; // Base XP for practice

    // Accuracy bonus
    if (accuracy >= 95) xp += 20;
    else if (accuracy >= 90) xp += 15;
    else if (accuracy >= 80) xp += 10;
    else if (accuracy >= 70) xp += 5;

    // Perfect score bonus
    if (isPerfect) xp += 25;

    // Time bonus (efficient practice)
    if (timeSpent < 30) xp += 10; // Quick practice
    else if (timeSpent > 120) xp += 5; // Thorough practice

    return xp;
  }

  // Get characters due for review
  async getCharactersForReview(userId: string, limit: number = 20): Promise<{ success: boolean; data?: CharacterMastery[]; message: string; error?: string }> {
    try {
      const now = new Date();
      
      const masteries = await this.prisma.characterMastery.findMany({
        where: {
          userId,
          nextReviewDate: {
            lte: now
          }
        },
        orderBy: [
          { nextReviewDate: 'asc' },
          { accuracyScore: 'asc' }
        ],
        take: limit
      });

      return {
        success: true,
        data: masteries,
        message: 'Characters for review retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get characters for review', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get characters for review',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get mastery statistics
  async getMasteryStatistics(userId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const [totalMasteries, masteryByLevel, masteryByType, recentProgress] = await Promise.all([
        // Total masteries
        this.prisma.characterMastery.count({
          where: { userId }
        }),

        // Mastery by level
        this.prisma.characterMastery.groupBy({
          by: ['masteryLevel'],
          where: { userId },
          _count: { id: true }
        }),

        // Mastery by type
        this.prisma.characterMastery.groupBy({
          by: ['characterType'],
          where: { userId },
          _count: { id: true },
          _avg: { accuracyScore: true }
        }),

        // Recent progress (last 30 days)
        this.prisma.practiceSession.findMany({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        })
      ]);

      // Calculate progress trends
      const progressTrends = this.calculateProgressTrends(recentProgress);

      return {
        success: true,
        data: {
          totalMasteries,
          masteryByLevel: masteryByLevel.map(item => ({
            level: item.masteryLevel,
            count: item._count.id
          })),
          masteryByType: masteryByType.map(item => ({
            type: item.characterType,
            count: item._count.id,
            averageAccuracy: item._avg.accuracyScore || 0
          })),
          progressTrends
        },
        message: 'Mastery statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get mastery statistics', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get mastery statistics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate progress trends
  private calculateProgressTrends(practiceSessions: PracticeSession[]): any {
    if (practiceSessions.length === 0) {
      return {
        averageAccuracy: 0,
        improvementRate: 0,
        practiceFrequency: 0,
        streakCount: 0
      };
    }

    // Calculate average accuracy
    const averageAccuracy = practiceSessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / practiceSessions.length;

    // Calculate improvement rate (comparing first half vs second half)
    const midPoint = Math.floor(practiceSessions.length / 2);
    const firstHalf = practiceSessions.slice(0, midPoint);
    const secondHalf = practiceSessions.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, session) => sum + (session.accuracy || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, session) => sum + (session.accuracy || 0), 0) / secondHalf.length;
    const improvementRate = secondHalfAvg - firstHalfAvg;

    // Calculate practice frequency (sessions per day)
    const days = Math.max(1, Math.ceil((Date.now() - practiceSessions[practiceSessions.length - 1].createdAt.getTime()) / (24 * 60 * 60 * 1000)));
    const practiceFrequency = practiceSessions.length / days;

    // Calculate current streak
    let streakCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < practiceSessions.length; i++) {
      const sessionDate = new Date(practiceSessions[i].createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === today.getTime() - (streakCount * 24 * 60 * 60 * 1000)) {
        streakCount++;
      } else {
        break;
      }
    }

    return {
      averageAccuracy,
      improvementRate,
      practiceFrequency,
      streakCount
    };
  }

  // Get weak areas
  async getWeakAreas(userId: string, limit: number = 10): Promise<{ success: boolean; data?: CharacterMastery[]; message: string; error?: string }> {
    try {
      const weakAreas = await this.prisma.characterMastery.findMany({
        where: {
          userId,
          OR: [
            { accuracyScore: { lt: 70 } },
            { masteryLevel: MasteryLevel.LEARNING }
          ]
        },
        orderBy: [
          { accuracyScore: 'asc' },
          { practiceCount: 'desc' }
        ],
        take: limit
      });

      return {
        success: true,
        data: weakAreas,
        message: 'Weak areas retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get weak areas', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get weak areas',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Reset character mastery (admin only)
  async resetCharacterMastery(userId: string, characterId: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete practice sessions
        await tx.practiceSession.deleteMany({
          where: {
            characterMastery: {
              userId,
              characterId
            }
          }
        });

        // Delete character mastery
        await tx.characterMastery.deleteMany({
          where: {
            userId,
            characterId
          }
        });
      });

      // Clear cache
      await cacheDel(`character_mastery:${userId}:${characterId}`);
      await cacheDel(`user_character_masteries:${userId}:all`);

      logger.info('Character mastery reset successfully', { userId, characterId });

      return {
        success: true,
        message: 'Character mastery reset successfully'
      };
    } catch (error) {
      logger.error('Failed to reset character mastery', { userId, characterId, error: error.message });
      return {
        success: false,
        message: 'Failed to reset character mastery',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

// Export singleton instance
export const characterMasteryService = new CharacterMasteryService(require('../config/database').default);

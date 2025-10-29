import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { authenticateJWT, checkUserAccess, adminOnly } from '../middleware/auth';

const router = Router();

// Progress routes
// GET /progress/:userId - Get user progress
router.get('/:userId', validateParams('userProgress'), checkUserAccess, progressController.getUserProgress);

// POST /progress/character-practice - Update character practice
router.post('/character-practice', authenticateJWT, validate('characterPractice'), progressController.updateCharacterPractice);

// PUT /progress/xp - Update XP
router.put('/xp', authenticateJWT, validate('xpTransaction'), progressController.updateXp);

// GET /progress/streaks/:userId - Get user streaks
router.get('/streaks/:userId', validateParams('userProgress'), checkUserAccess, validateQuery('pagination'), progressController.getUserStreaks);

// GET /progress/achievements/:userId - Get user achievements
router.get('/achievements/:userId', validateParams('userProgress'), checkUserAccess, validateQuery('pagination'), progressController.getUserAchievements);

// POST /progress/update-mastery - Update character mastery
router.post('/update-mastery', authenticateJWT, validate('characterMastery'), progressController.updateCharacterMastery);

// GET /progress/analytics/:userId - Get user analytics
router.get('/analytics/:userId', validateParams('userProgress'), checkUserAccess, validateQuery('analytics'), progressController.getUserAnalytics);

// GET /progress/leaderboard/:period - Get leaderboard
router.get('/leaderboard/:period', validateParams('leaderboardQuery'), validateQuery('pagination'), progressController.getLeaderboard);

// GET /progress/rank/:userId/:period - Get user rank
router.get('/rank/:userId/:period', validateParams('userProgress'), checkUserAccess, progressController.getUserRank);

// GET /progress/insights/:userId - Get learning insights
router.get('/insights/:userId', validateParams('userProgress'), checkUserAccess, validateQuery('analytics'), progressController.getLearningInsights);

// GET /progress/metrics/:userId - Get progress metrics
router.get('/metrics/:userId', validateParams('userProgress'), checkUserAccess, progressController.getProgressMetrics);

// POST /progress/freeze-streak - Freeze streak
router.post('/freeze-streak', authenticateJWT, validate('streak'), progressController.freezeStreak);

// GET /progress/review/:userId - Get characters for review
router.get('/review/:userId', validateParams('userProgress'), checkUserAccess, validateQuery('pagination'), progressController.getCharactersForReview);

// GET /progress/weak-areas/:userId - Get weak areas
router.get('/weak-areas/:userId', validateParams('userProgress'), checkUserAccess, validateQuery('pagination'), progressController.getWeakAreas);

export { router as progressRoutes };

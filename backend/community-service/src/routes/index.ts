import { Router } from 'express';
import { forumController } from '../controllers/forum.controller';
import { studyGroupController } from '../controllers/study-group.controller';
import { socialController } from '../controllers/social.controller';
import { leaderboardController } from '../controllers/leaderboard.controller';
import { moderationController } from '../controllers/moderation.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  createPostSchema, 
  updatePostSchema, 
  createCommentSchema, 
  updateCommentSchema,
  voteSchema,
  searchSchema,
  createStudyGroupSchema,
  updateStudyGroupSchema,
  createChallengeSchema,
  createFriendRequestSchema,
  updateFriendRequestSchema,
  createMentorshipRequestSchema,
  createReportSchema,
  updateReportSchema
} from '../middleware/validation';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Forum Routes
router.get('/forums', forumController.getCategories);
router.get('/forums/:slug', forumController.getCategory);

router.get('/posts', forumController.getPosts);
router.get('/posts/search', validateRequest(searchSchema), forumController.searchPosts);
router.get('/posts/:postId', forumController.getPost);
router.post('/posts', authenticate, validateRequest(createPostSchema), forumController.createPost);
router.put('/posts/:postId', authenticate, validateRequest(updatePostSchema), forumController.updatePost);
router.delete('/posts/:postId', authenticate, forumController.deletePost);
router.patch('/posts/:postId/pin', authenticate, forumController.pinPost);

router.get('/posts/:postId/comments', forumController.getComments);
router.post('/posts/:postId/comments', authenticate, validateRequest(createCommentSchema), forumController.createComment);
router.put('/comments/:commentId', authenticate, validateRequest(updateCommentSchema), forumController.updateComment);
router.delete('/comments/:commentId', authenticate, forumController.deleteComment);

router.post('/posts/:postId/vote', authenticate, validateRequest(voteSchema), forumController.votePost);
router.post('/comments/:commentId/vote', authenticate, validateRequest(voteSchema), forumController.voteComment);

// Study Group Routes
router.get('/study-groups', studyGroupController.getStudyGroups);
router.get('/study-groups/my', authenticate, studyGroupController.getUserStudyGroups);
router.get('/study-groups/:groupId', studyGroupController.getStudyGroup);
router.post('/study-groups', authenticate, validateRequest(createStudyGroupSchema), studyGroupController.createStudyGroup);
router.put('/study-groups/:groupId', authenticate, validateRequest(updateStudyGroupSchema), studyGroupController.updateStudyGroup);
router.delete('/study-groups/:groupId', authenticate, studyGroupController.deleteStudyGroup);

router.post('/study-groups/:groupId/join', authenticate, studyGroupController.joinStudyGroup);
router.post('/study-groups/:groupId/leave', authenticate, studyGroupController.leaveStudyGroup);
router.put('/study-groups/:groupId/members/:memberId/role', authenticate, studyGroupController.updateMemberRole);
router.delete('/study-groups/:groupId/members/:memberId', authenticate, studyGroupController.removeMember);

router.get('/study-groups/:groupId/challenges', studyGroupController.getChallenges);
router.post('/study-groups/:groupId/challenges', authenticate, validateRequest(createChallengeSchema), studyGroupController.createChallenge);
router.put('/challenges/:challengeId', authenticate, studyGroupController.updateChallenge);
router.delete('/challenges/:challengeId', authenticate, studyGroupController.deleteChallenge);

// Social Features Routes
router.get('/friends/requests', authenticate, socialController.getFriendRequests);
router.post('/friends/requests', authenticate, validateRequest(createFriendRequestSchema), socialController.createFriendRequest);
router.put('/friends/requests/:requestId', authenticate, validateRequest(updateFriendRequestSchema), socialController.updateFriendRequest);
router.delete('/friends/requests/:requestId', authenticate, socialController.cancelFriendRequest);

router.get('/friends', authenticate, socialController.getFriends);
router.delete('/friends/:friendId', authenticate, socialController.removeFriend);

router.post('/users/:userId/follow', authenticate, socialController.followUser);
router.delete('/users/:userId/follow', authenticate, socialController.unfollowUser);
router.get('/users/:userId/followers', socialController.getFollowers);
router.get('/users/:userId/following', socialController.getFollowing);

router.get('/users/:userId/activity', socialController.getUserActivity);
router.get('/users/:userId/achievements', socialController.getUserAchievements);
router.get('/users/:userId/stats', socialController.getUserStats);
router.get('/activity/friends', authenticate, socialController.getFriendActivity);

router.get('/mentorship/requests', authenticate, socialController.getMentorshipRequests);
router.post('/mentorship/requests', authenticate, validateRequest(createMentorshipRequestSchema), socialController.createMentorshipRequest);
router.put('/mentorship/requests/:requestId', authenticate, socialController.updateMentorshipRequest);

// Leaderboard Routes
router.get('/leaderboard', leaderboardController.getLeaderboard);
router.get('/leaderboard/stats', leaderboardController.getLeaderboardStats);
router.get('/leaderboard/users/:userId/rank/:type', leaderboardController.getUserRank);
router.get('/leaderboard/users/:userId/around/:type', leaderboardController.getLeaderboardAroundUser);
router.get('/leaderboard/categories/:categoryId/:type', leaderboardController.getCategoryLeaderboard);
router.get('/leaderboard/groups/:groupId/:type', leaderboardController.getGroupLeaderboard);
router.get('/users/:userId/achievements', socialController.getUserAchievements);
router.post('/achievements/check', authenticate, leaderboardController.checkAchievements);

// Admin Leaderboard Routes
router.post('/admin/leaderboard/daily', authenticate, leaderboardController.updateDailyLeaderboards);
router.post('/admin/leaderboard/weekly', authenticate, leaderboardController.updateWeeklyLeaderboards);
router.post('/admin/leaderboard/monthly', authenticate, leaderboardController.updateMonthlyLeaderboards);
router.delete('/admin/leaderboard/cache', authenticate, leaderboardController.clearLeaderboardCache);

// Moderation Routes
router.get('/reports', authenticate, moderationController.getReports);
router.get('/reports/:reportId', authenticate, moderationController.getReport);
router.post('/reports', authenticate, validateRequest(createReportSchema), moderationController.createReport);
router.put('/reports/:reportId', authenticate, validateRequest(updateReportSchema), moderationController.updateReport);

router.post('/moderate/content', authenticate, moderationController.moderateContent);
router.post('/moderate/users/:userId', authenticate, moderationController.moderateUser);

router.post('/users/:userId/suspend', authenticate, moderationController.suspendUser);
router.post('/users/:userId/unsuspend', authenticate, moderationController.unsuspendUser);
router.post('/users/:userId/promote', authenticate, moderationController.promoteToModerator);
router.post('/users/:userId/demote', authenticate, moderationController.demoteFromModerator);

router.delete('/posts/:postId', authenticate, moderationController.deletePost);
router.delete('/comments/:commentId', authenticate, moderationController.deleteComment);

router.get('/moderation/dashboard', authenticate, moderationController.getModerationDashboard);
router.get('/moderation/stats', authenticate, moderationController.getModerationStats);

export default router;

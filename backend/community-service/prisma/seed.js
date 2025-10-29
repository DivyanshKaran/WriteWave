"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seeding...');
    const categories = await Promise.all([
        prisma.forumCategory.upsert({
            where: { slug: 'character-help' },
            update: {},
            create: {
                name: 'Character Help',
                description: 'Get help with Chinese characters, stroke order, and character recognition',
                slug: 'character-help',
                icon: '🈳',
                color: '#3B82F6',
                order: 1
            }
        }),
        prisma.forumCategory.upsert({
            where: { slug: 'vocabulary' },
            update: {},
            create: {
                name: 'Vocabulary',
                description: 'Discuss vocabulary, word meanings, and usage',
                slug: 'vocabulary',
                icon: '📚',
                color: '#10B981',
                order: 2
            }
        }),
        prisma.forumCategory.upsert({
            where: { slug: 'culture' },
            update: {},
            create: {
                name: 'Culture',
                description: 'Learn about Chinese culture, traditions, and customs',
                slug: 'culture',
                icon: '🏮',
                color: '#F59E0B',
                order: 3
            }
        }),
        prisma.forumCategory.upsert({
            where: { slug: 'general' },
            update: {},
            create: {
                name: 'General Discussion',
                description: 'General discussions about learning Chinese',
                slug: 'general',
                icon: '💬',
                color: '#8B5CF6',
                order: 4
            }
        })
    ]);
    console.log('Created forum categories:', categories.length);
    const users = await Promise.all([
        prisma.user.upsert({
            where: { externalUserId: 'user-1' },
            update: {},
            create: {
                externalUserId: 'user-1',
                username: 'chinese_learner_1',
                email: 'learner1@example.com',
                displayName: 'Chinese Learner 1',
                bio: 'Passionate about learning Chinese characters',
                reputation: 150,
                isModerator: false
            }
        }),
        prisma.user.upsert({
            where: { externalUserId: 'user-2' },
            update: {},
            create: {
                externalUserId: 'user-2',
                username: 'chinese_learner_2',
                email: 'learner2@example.com',
                displayName: 'Chinese Learner 2',
                bio: 'Love studying Chinese vocabulary',
                reputation: 200,
                isModerator: false
            }
        }),
        prisma.user.upsert({
            where: { externalUserId: 'moderator-1' },
            update: {},
            create: {
                externalUserId: 'moderator-1',
                username: 'community_moderator',
                email: 'moderator@example.com',
                displayName: 'Community Moderator',
                bio: 'Helping the community learn Chinese',
                reputation: 500,
                isModerator: true
            }
        })
    ]);
    console.log('Created users:', users.length);
    const posts = await Promise.all([
        prisma.post.create({
            data: {
                title: 'How to remember stroke order for complex characters?',
                content: 'I\'m struggling with remembering the correct stroke order for complex Chinese characters. Does anyone have any tips or techniques that have worked for them?',
                slug: 'how-to-remember-stroke-order-for-complex-characters',
                categoryId: categories[0].id,
                authorId: users[0].id
            }
        }),
        prisma.post.create({
            data: {
                title: 'Best resources for learning Chinese vocabulary',
                content: 'What are your favorite resources for expanding your Chinese vocabulary? I\'m looking for both apps and traditional study materials.',
                slug: 'best-resources-for-learning-chinese-vocabulary',
                categoryId: categories[1].id,
                authorId: users[1].id
            }
        }),
        prisma.post.create({
            data: {
                title: 'Understanding Chinese New Year traditions',
                content: 'Can someone explain the significance of different Chinese New Year traditions? I\'m particularly interested in the food and decorations.',
                slug: 'understanding-chinese-new-year-traditions',
                categoryId: categories[2].id,
                authorId: users[0].id
            }
        })
    ]);
    console.log('Created posts:', posts.length);
    const comments = await Promise.all([
        prisma.comment.create({
            data: {
                content: 'Great question! I find that practicing with apps like Pleco really helps with stroke order.',
                postId: posts[0].id,
                authorId: users[1].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'I agree! Also, breaking down complex characters into radicals helps a lot.',
                postId: posts[0].id,
                authorId: users[2].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Anki flashcards have been incredibly helpful for vocabulary retention.',
                postId: posts[1].id,
                authorId: users[0].id
            }
        })
    ]);
    console.log('Created comments:', comments.length);
    const studyGroups = await Promise.all([
        prisma.studyGroup.create({
            data: {
                name: 'Beginner Chinese Characters',
                description: 'A study group for beginners learning Chinese characters',
                slug: 'beginner-chinese-characters',
                ownerId: users[2].id,
                isPublic: true,
                maxMembers: 50
            }
        }),
        prisma.studyGroup.create({
            data: {
                name: 'Advanced Vocabulary Builders',
                description: 'For intermediate to advanced learners looking to expand their vocabulary',
                slug: 'advanced-vocabulary-builders',
                ownerId: users[1].id,
                isPublic: true,
                maxMembers: 30
            }
        })
    ]);
    console.log('Created study groups:', studyGroups.length);
    await Promise.all([
        prisma.studyGroupMember.create({
            data: {
                groupId: studyGroups[0].id,
                userId: users[0].id,
                role: 'MEMBER'
            }
        }),
        prisma.studyGroupMember.create({
            data: {
                groupId: studyGroups[0].id,
                userId: users[1].id,
                role: 'MEMBER'
            }
        }),
        prisma.studyGroupMember.create({
            data: {
                groupId: studyGroups[1].id,
                userId: users[0].id,
                role: 'MEMBER'
            }
        })
    ]);
    console.log('Added members to study groups');
    const achievements = await Promise.all([
        prisma.userAchievement.create({
            data: {
                userId: users[0].id,
                achievementType: 'FIRST_POST',
                title: 'First Post',
                description: 'Created your first post',
                icon: '📝',
                points: 10
            }
        }),
        prisma.userAchievement.create({
            data: {
                userId: users[1].id,
                achievementType: 'HELPFUL_MEMBER',
                title: 'Helpful Member',
                description: 'Gained 100 reputation points',
                icon: '👍',
                points: 50
            }
        })
    ]);
    console.log('Created achievements:', achievements.length);
    const leaderboardEntries = await Promise.all([
        prisma.leaderboardEntry.create({
            data: {
                userId: users[1].id,
                type: 'REPUTATION',
                score: 200,
                rank: 1
            }
        }),
        prisma.leaderboardEntry.create({
            data: {
                userId: users[0].id,
                type: 'REPUTATION',
                score: 150,
                rank: 2
            }
        }),
        prisma.leaderboardEntry.create({
            data: {
                userId: users[2].id,
                type: 'REPUTATION',
                score: 500,
                rank: 1
            }
        })
    ]);
    console.log('Created leaderboard entries:', leaderboardEntries.length);
    const activities = await Promise.all([
        prisma.activity.create({
            data: {
                userId: users[0].id,
                type: 'POST_CREATED',
                title: 'Created a new post',
                description: 'Posted "How to remember stroke order for complex characters?" in Character Help',
                metadata: { postId: posts[0].id, categoryId: categories[0].id }
            }
        }),
        prisma.activity.create({
            data: {
                userId: users[1].id,
                type: 'COMMENT_ADDED',
                title: 'Added a comment',
                description: 'Commented on "How to remember stroke order for complex characters?"',
                metadata: { postId: posts[0].id, commentId: comments[0].id }
            }
        }),
        prisma.activity.create({
            data: {
                userId: users[0].id,
                type: 'GROUP_JOINED',
                title: 'Joined a study group',
                description: 'Joined "Beginner Chinese Characters"',
                metadata: { groupId: studyGroups[0].id },
                groupId: studyGroups[0].id
            }
        })
    ]);
    console.log('Created activities:', activities.length);
    console.log('Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
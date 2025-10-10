import { prisma } from '@/models';
import { 
  StudyGroup, 
  StudyGroupMember, 
  StudyGroupChallenge,
  CreateStudyGroupRequest, 
  UpdateStudyGroupRequest,
  CreateChallengeRequest,
  GroupRole,
  ChallengeType,
  PaginationQuery
} from '@/types';
import { AppError } from '@/utils/errors';
import { createSlug } from '@/utils/helpers';
import { contentModeration } from '@/utils/moderation';

export class StudyGroupService {
  // Study Groups
  async getStudyGroups(pagination: PaginationQuery = {}, userId?: string): Promise<{ groups: StudyGroup[], total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    const where: any = { isActive: true, isPublic: true };

    const [groups, total] = await Promise.all([
      prisma.studyGroup.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
            },
          },
          members: {
            where: { isActive: true },
            select: {
              id: true,
              userId: true,
              role: true,
              joinedAt: true,
            },
          },
          _count: {
            select: { members: { where: { isActive: true } } }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.studyGroup.count({ where })
    ]);

    // Add user role if userId provided
    if (userId) {
      for (const group of groups) {
        const userMember = group.members.find(member => member.userId === userId);
        group.userRole = userMember?.role;
        group.memberCount = group._count.members;
      }
    }

    return { groups, total };
  }

  async getStudyGroup(groupId: string, userId?: string): Promise<StudyGroup | null> {
    const group = await prisma.getStudyGroupWithMembers(groupId, userId);
    
    if (group && userId) {
      const userMember = group.members.find(member => member.userId === userId);
      group.userRole = userMember?.role;
      group.memberCount = group.members.length;
    }

    return group;
  }

  async createStudyGroup(data: CreateStudyGroupRequest, ownerId: string): Promise<StudyGroup> {
    // Content moderation
    const moderationResult = await contentModeration.checkContent(data.name + ' ' + (data.description || ''));
    if (!moderationResult.isApproved) {
      throw new AppError('Content violates community guidelines', 400);
    }

    const slug = createSlug(data.name);
    
    // Check if slug already exists
    const existingGroup = await prisma.studyGroup.findUnique({ where: { slug } });
    if (existingGroup) {
      throw new AppError('A study group with this name already exists', 400);
    }

    const group = await prisma.studyGroup.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        ownerId,
        isPublic: data.isPublic,
        maxMembers: data.maxMembers || 50,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                reputation: true,
              },
            },
          },
        },
      },
    });

    // Add owner as member
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: ownerId,
        role: GroupRole.OWNER,
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: ownerId,
        type: 'GROUP_JOINED',
        title: 'Created a study group',
        description: `Created study group "${data.name}"`,
        metadata: { groupId: group.id }
      }
    });

    return group;
  }

  async updateStudyGroup(groupId: string, data: UpdateStudyGroupRequest, userId: string): Promise<StudyGroup> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    // Check if user is owner or admin
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!member || ![GroupRole.OWNER, GroupRole.ADMIN].includes(member.role)) {
      throw new AppError('Not authorized to update this study group', 403);
    }

    // Content moderation for updates
    if (data.name || data.description) {
      const content = (data.name || group.name) + ' ' + (data.description || group.description || '');
      const moderationResult = await contentModeration.checkContent(content);
      if (!moderationResult.isApproved) {
        throw new AppError('Content violates community guidelines', 400);
      }
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = createSlug(data.name);
    }

    return prisma.studyGroup.update({
      where: { id: groupId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                reputation: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteStudyGroup(groupId: string, userId: string): Promise<void> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    if (group.ownerId !== userId) {
      throw new AppError('Only the owner can delete the study group', 403);
    }

    await prisma.studyGroup.update({
      where: { id: groupId },
      data: { isActive: false }
    });
  }

  // Member Management
  async joinStudyGroup(groupId: string, userId: string): Promise<void> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group || !group.isActive) {
      throw new AppError('Study group not found', 404);
    }

    if (!group.isPublic) {
      throw new AppError('This study group is private', 403);
    }

    // Check if user is already a member
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new AppError('You are already a member of this study group', 400);
      } else {
        // Reactivate membership
        await prisma.studyGroupMember.update({
          where: { id: existingMember.id },
          data: { isActive: true }
        });
      }
    } else {
      // Check if group is full
      const memberCount = await prisma.studyGroupMember.count({
        where: { groupId, isActive: true }
      });

      if (memberCount >= group.maxMembers) {
        throw new AppError('Study group is full', 400);
      }

      // Add new member
      await prisma.studyGroupMember.create({
        data: {
          groupId,
          userId,
          role: GroupRole.MEMBER,
        }
      });
    }

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'GROUP_JOINED',
        title: 'Joined a study group',
        description: `Joined study group "${group.name}"`,
        metadata: { groupId },
        groupId,
      }
    });
  }

  async leaveStudyGroup(groupId: string, userId: string): Promise<void> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    if (group.ownerId === userId) {
      throw new AppError('Owner cannot leave the study group. Transfer ownership or delete the group instead.', 400);
    }

    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!member || !member.isActive) {
      throw new AppError('You are not a member of this study group', 400);
    }

    await prisma.studyGroupMember.update({
      where: { id: member.id },
      data: { isActive: false }
    });
  }

  async updateMemberRole(groupId: string, memberId: string, newRole: GroupRole, userId: string): Promise<void> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    // Check if user is owner or admin
    const requesterMember = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!requesterMember || ![GroupRole.OWNER, GroupRole.ADMIN].includes(requesterMember.role)) {
      throw new AppError('Not authorized to update member roles', 403);
    }

    const member = await prisma.studyGroupMember.findUnique({
      where: { id: memberId }
    });

    if (!member || member.groupId !== groupId) {
      throw new AppError('Member not found', 404);
    }

    // Prevent demoting the owner
    if (member.role === GroupRole.OWNER) {
      throw new AppError('Cannot change the owner role', 400);
    }

    await prisma.studyGroupMember.update({
      where: { id: memberId },
      data: { role: newRole }
    });
  }

  async removeMember(groupId: string, memberId: string, userId: string): Promise<void> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    // Check if user is owner or admin
    const requesterMember = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!requesterMember || ![GroupRole.OWNER, GroupRole.ADMIN].includes(requesterMember.role)) {
      throw new AppError('Not authorized to remove members', 403);
    }

    const member = await prisma.studyGroupMember.findUnique({
      where: { id: memberId }
    });

    if (!member || member.groupId !== groupId) {
      throw new AppError('Member not found', 404);
    }

    // Prevent removing the owner
    if (member.role === GroupRole.OWNER) {
      throw new AppError('Cannot remove the owner', 400);
    }

    await prisma.studyGroupMember.update({
      where: { id: memberId },
      data: { isActive: false }
    });
  }

  // Challenges
  async getChallenges(groupId: string, pagination: PaginationQuery = {}): Promise<{ challenges: StudyGroupChallenge[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [challenges, total] = await Promise.all([
      prisma.studyGroupChallenge.findMany({
        where: { groupId, isActive: true },
        orderBy: { startDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.studyGroupChallenge.count({ where: { groupId, isActive: true } })
    ]);

    return { challenges, total };
  }

  async createChallenge(groupId: string, data: CreateChallengeRequest, userId: string): Promise<StudyGroupChallenge> {
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    // Check if user is owner or admin
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!member || ![GroupRole.OWNER, GroupRole.ADMIN].includes(member.role)) {
      throw new AppError('Not authorized to create challenges', 403);
    }

    // Content moderation
    const moderationResult = await contentModeration.checkContent(data.title + ' ' + data.description);
    if (!moderationResult.isApproved) {
      throw new AppError('Content violates community guidelines', 400);
    }

    const challenge = await prisma.studyGroupChallenge.create({
      data: {
        groupId,
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'CHALLENGE_COMPLETED',
        title: 'Created a challenge',
        description: `Created challenge "${data.title}" in ${group.name}`,
        metadata: { groupId, challengeId: challenge.id },
        groupId,
      }
    });

    return challenge;
  }

  async updateChallenge(challengeId: string, data: Partial<CreateChallengeRequest>, userId: string): Promise<StudyGroupChallenge> {
    const challenge = await prisma.studyGroupChallenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    const group = await prisma.studyGroup.findUnique({ where: { id: challenge.groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    // Check if user is owner or admin
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: challenge.groupId, userId } }
    });

    if (!member || ![GroupRole.OWNER, GroupRole.ADMIN].includes(member.role)) {
      throw new AppError('Not authorized to update challenges', 403);
    }

    // Content moderation for updates
    if (data.title || data.description) {
      const content = (data.title || challenge.title) + ' ' + (data.description || challenge.description);
      const moderationResult = await contentModeration.checkContent(content);
      if (!moderationResult.isApproved) {
        throw new AppError('Content violates community guidelines', 400);
      }
    }

    return prisma.studyGroupChallenge.update({
      where: { id: challengeId },
      data,
    });
  }

  async deleteChallenge(challengeId: string, userId: string): Promise<void> {
    const challenge = await prisma.studyGroupChallenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    const group = await prisma.studyGroup.findUnique({ where: { id: challenge.groupId } });
    if (!group) {
      throw new AppError('Study group not found', 404);
    }

    // Check if user is owner or admin
    const member = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: challenge.groupId, userId } }
    });

    if (!member || ![GroupRole.OWNER, GroupRole.ADMIN].includes(member.role)) {
      throw new AppError('Not authorized to delete challenges', 403);
    }

    await prisma.studyGroupChallenge.update({
      where: { id: challengeId },
      data: { isActive: false }
    });
  }

  // User's Study Groups
  async getUserStudyGroups(userId: string, pagination: PaginationQuery = {}): Promise<{ groups: StudyGroup[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [memberships, total] = await Promise.all([
      prisma.studyGroupMember.findMany({
        where: { userId, isActive: true },
        include: {
          group: {
            include: {
              owner: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  reputation: true,
                },
              },
              _count: {
                select: { members: { where: { isActive: true } } }
              }
            }
          }
        },
        orderBy: { joinedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.studyGroupMember.count({ where: { userId, isActive: true } })
    ]);

    const groups = memberships.map(membership => ({
      ...membership.group,
      userRole: membership.role,
      memberCount: membership.group._count.members
    }));

    return { groups, total };
  }
}

export const studyGroupService = new StudyGroupService();
